-- Chat visitor rules:
--   * at most p_burst_max answered requests per burst, then a p_cooldown_s cooldown
--   * more than p_ban_threshold answered requests within 30 days => ban for p_ban_days (0 = permanent)
-- Visitors are keyed by hashed IP and by the anonymous browser id. Service role only.

create table if not exists public.visitor_bans (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('ip', 'client')),
  key_hash text not null,
  scope text not null,
  reason text,
  banned_at timestamptz not null default now(),
  banned_until timestamptz,            -- null = permanent
  unique (kind, key_hash, scope)
);
alter table public.visitor_bans enable row level security;

create or replace function public.check_visitor_limit(
  p_ip_hash text,
  p_client_id text,
  p_scope text default 'chat',
  p_burst_max int default 10,
  p_burst_window_s int default 600,
  p_cooldown_s int default 120,
  p_ban_threshold int default 20,
  p_ban_days int default 30,
  p_global_per_day int default 2000
)
returns table (allowed boolean, reason text, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ban_until timestamptz;
  v_banned boolean := false;
  v_ip_count int;
  v_client_count int := 0;
  v_cd_at timestamptz;
  v_since timestamptz;
  v_count int;
  v_until timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext(p_scope || ':' || p_ip_hash));

  -- 1) already banned (by IP or browser id)?
  select b.banned_until, true into v_ban_until, v_banned
    from visitor_bans b
    where b.scope = p_scope
      and ((b.kind = 'ip' and b.key_hash = p_ip_hash)
        or (b.kind = 'client' and p_client_id is not null and b.key_hash = p_client_id))
      and (b.banned_until is null or b.banned_until > now())
    order by b.banned_until desc nulls first
    limit 1;
  if coalesce(v_banned, false) then
    insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
      values (p_ip_hash, p_client_id, true, 'banned', p_scope);
    return query select false, 'banned'::text,
      case when v_ban_until is null then 0 else greatest(1, ceil(extract(epoch from (v_ban_until - now())))::int) end;
    return;
  end if;

  -- 2) too many answered requests in the last 30 days => ban
  select count(*) into v_ip_count from chat_request_log
    where scope = p_scope and ip_hash = p_ip_hash and not blocked and created_at > now() - interval '30 days';
  if p_client_id is not null then
    select count(*) into v_client_count from chat_request_log
      where scope = p_scope and client_id = p_client_id and not blocked and created_at > now() - interval '30 days';
  end if;
  if v_ip_count >= p_ban_threshold or v_client_count >= p_ban_threshold then
    v_until := case when p_ban_days > 0 then now() + make_interval(days => p_ban_days) else null end;
    if v_ip_count >= p_ban_threshold then
      insert into visitor_bans (kind, key_hash, scope, reason, banned_until)
        values ('ip', p_ip_hash, p_scope, 'over_30_day_limit', v_until)
        on conflict (kind, key_hash, scope) do update
          set banned_at = now(), banned_until = excluded.banned_until, reason = excluded.reason;
    end if;
    if p_client_id is not null and v_client_count >= p_ban_threshold then
      insert into visitor_bans (kind, key_hash, scope, reason, banned_until)
        values ('client', p_client_id, p_scope, 'over_30_day_limit', v_until)
        on conflict (kind, key_hash, scope) do update
          set banned_at = now(), banned_until = excluded.banned_until, reason = excluded.reason;
    end if;
    insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
      values (p_ip_hash, p_client_id, true, 'banned', p_scope);
    return query select false, 'banned'::text,
      case when v_until is null then 0 else greatest(1, ceil(extract(epoch from (v_until - now())))::int) end;
    return;
  end if;

  -- 3) cooldown in progress? (the latest 'cooldown' marker is still within p_cooldown_s)
  select max(l.created_at) into v_cd_at from chat_request_log l
    where l.scope = p_scope and l.ip_hash = p_ip_hash and l.reason = 'cooldown';
  if v_cd_at is not null and v_cd_at + make_interval(secs => p_cooldown_s) > now() then
    insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
      values (p_ip_hash, p_client_id, true, 'cooldown_active', p_scope);
    return query select false, 'cooldown'::text,
      greatest(1, ceil(extract(epoch from (v_cd_at + make_interval(secs => p_cooldown_s) - now())))::int);
    return;
  end if;

  -- 4) burst: answered requests since the later of (window start, end of last cooldown)
  v_since := now() - make_interval(secs => p_burst_window_s);
  if v_cd_at is not null and v_cd_at + make_interval(secs => p_cooldown_s) > v_since then
    v_since := v_cd_at + make_interval(secs => p_cooldown_s);
  end if;
  select count(*) into v_count from chat_request_log
    where scope = p_scope and ip_hash = p_ip_hash and not blocked and created_at > v_since;
  if v_count >= p_burst_max then
    insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
      values (p_ip_hash, p_client_id, true, 'cooldown', p_scope);
    return query select false, 'cooldown'::text, p_cooldown_s;
    return;
  end if;

  -- 5) site-wide daily budget
  select count(*) into v_count from chat_request_log
    where scope = p_scope and not blocked and created_at > now() - interval '1 day';
  if v_count >= p_global_per_day then
    insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
      values (p_ip_hash, p_client_id, true, 'global_day', p_scope);
    return query select false, 'global_day'::text, 3600;
    return;
  end if;

  insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
    values (p_ip_hash, p_client_id, false, null, p_scope);

  -- housekeeping (keep > 30 days so the monthly count stays accurate)
  if random() < 0.01 then
    delete from chat_request_log where created_at < now() - interval '45 days';
  end if;

  return query select true, null::text, 0;
end;
$$;

revoke all on function public.check_visitor_limit(text, text, text, int, int, int, int, int, int) from public, anon, authenticated;
grant execute on function public.check_visitor_limit(text, text, text, int, int, int, int, int, int) to service_role;

-- check_rate_limit (contact form etc.) used to purge rows older than 14 days, which would erase the
-- 30-day history the ban rule needs. Re-create it without the purge.
create or replace function public.check_rate_limit(
  p_ip_hash text,
  p_client_id text,
  p_scope text default 'chat',
  p_ip_per_min int default 6,
  p_ip_per_hour int default 40,
  p_ip_per_day int default 120,
  p_client_per_hour int default 30,
  p_global_per_day int default 2000
)
returns table (allowed boolean, reason text, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text := null;
  v_retry int := 0;
  v_oldest timestamptz;
  v_count int;
begin
  -- serialize concurrent requests for the same key so count + insert is atomic
  perform pg_advisory_xact_lock(hashtext(p_scope || ':' || p_ip_hash));

  select count(*), min(created_at) into v_count, v_oldest
    from chat_request_log
    where scope = p_scope and ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 minute';
  if v_count >= p_ip_per_min then
    v_reason := 'ip_minute';
    v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 minute' - now())))::int);
  end if;

  if v_reason is null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log
      where scope = p_scope and ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 hour';
    if v_count >= p_ip_per_hour then
      v_reason := 'ip_hour';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::int);
    end if;
  end if;

  if v_reason is null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log
      where scope = p_scope and ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 day';
    if v_count >= p_ip_per_day then
      v_reason := 'ip_day';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 day' - now())))::int);
    end if;
  end if;

  if v_reason is null and p_client_id is not null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log
      where scope = p_scope and client_id = p_client_id and not blocked and created_at > now() - interval '1 hour';
    if v_count >= p_client_per_hour then
      v_reason := 'client_hour';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::int);
    end if;
  end if;

  if v_reason is null then
    select count(*) into v_count
      from chat_request_log
      where scope = p_scope and not blocked and created_at > now() - interval '1 day';
    if v_count >= p_global_per_day then
      v_reason := 'global_day';
      v_retry := 3600;
    end if;
  end if;

  insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
    values (p_ip_hash, p_client_id, v_reason is not null, v_reason, p_scope);

  -- no purge here: check_visitor_limit() owns retention (45 days) so 30-day counts stay accurate

  return query select (v_reason is null), v_reason, v_retry;
end;
$$;

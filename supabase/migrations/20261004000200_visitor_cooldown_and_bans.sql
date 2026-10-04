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
alter table public.visitor_bans add column if not exists ip_hash text;  -- IP seen when a client ban was issued
create index if not exists visitor_bans_ip_idx on public.visitor_bans (scope, ip_hash) where kind = 'client';
alter table public.visitor_bans enable row level security;

-- Identity model: a visitor is the anonymous browser id (primary) AND the IP (backstop).
--  * Browser id present: its limits are the base numbers; the IP backstop is p_ip_multiplier times
--    looser, so one heavy user behind a shared network (office, campus, carrier NAT) cannot get
--    everyone else on that IP cooled down or banned, while rotating browser ids still hits the IP cap.
--  * No browser id (curl/bots): the IP is held to the base numbers.
--  * p_ip_trusted = false (no real IP was available, key is derived from headers): the IP subject is
--    never banned, because that key can be shared or spoofed.
--  * Ban evasion: when a browser id is banned, the IP it came from is marked "suspect" for the length of
--    the ban and its IP backstop shrinks from p_ip_multiplier to p_suspect_multiplier times, so
--    picking a fresh browser id does not restore full allowance.
drop function if exists public.check_visitor_limit(text, text, text, int, int, int, int, int, int);
drop function if exists public.check_visitor_limit(text, text, text, int, int, int, int, int, int, int, boolean);

create or replace function public.check_visitor_limit(
  p_ip_hash text,
  p_client_id text,
  p_scope text default 'chat',
  p_burst_max int default 10,
  p_burst_window_s int default 600,
  p_cooldown_s int default 120,
  p_ban_threshold int default 20,
  p_ban_days int default 30,
  p_global_per_day int default 2000,
  p_ip_multiplier int default 5,
  p_ip_trusted boolean default true,
  p_suspect_multiplier int default 2
)
returns table (allowed boolean, reason text, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
  v_key text;
  v_burst int;
  v_ban int;
  v_can_ban boolean;
  v_ban_until timestamptz;
  v_banned boolean := false;
  v_suspect boolean := false;
  v_ip_mult int;
  v_count int;
  v_cd_at timestamptz;
  v_since timestamptz;
  v_until timestamptz;
begin
  -- Serialize per IP and per browser id (always in this order, so no lock cycles) so parallel
  -- requests cannot all pass the same count check.
  perform pg_advisory_xact_lock(hashtext(p_scope || ':ip:' || p_ip_hash));
  if p_client_id is not null then
    perform pg_advisory_xact_lock(hashtext(p_scope || ':client:' || p_client_id));
  end if;

  -- A) already banned (browser id, or a trusted IP)?
  select b.banned_until, true into v_ban_until, v_banned
    from visitor_bans b
    where b.scope = p_scope
      and ((b.kind = 'ip' and b.key_hash = p_ip_hash and p_ip_trusted)
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

  -- Is this IP the origin of an active client ban? Then its backstop is tightened.
  if p_ip_trusted then
    select exists (
      select 1 from visitor_bans b
      where b.scope = p_scope and b.kind = 'client' and b.ip_hash = p_ip_hash
        and (b.banned_until is null or b.banned_until > now())
    ) into v_suspect;
  end if;
  v_ip_mult := case when v_suspect then least(p_ip_multiplier, p_suspect_multiplier) else p_ip_multiplier end;

  -- B) 30-day answered-request count per subject => ban
  foreach v_kind in array array['client', 'ip'] loop
    if v_kind = 'client' and p_client_id is null then continue; end if;
    v_key := case when v_kind = 'ip' then p_ip_hash else p_client_id end;
    v_ban := case when v_kind = 'ip' and p_client_id is not null then p_ban_threshold * v_ip_mult else p_ban_threshold end;
    v_can_ban := not (v_kind = 'ip' and not p_ip_trusted);

    select count(*) into v_count from chat_request_log l
      where l.scope = p_scope and not l.blocked and l.created_at > now() - interval '30 days'
        and ((v_kind = 'ip' and l.ip_hash = v_key) or (v_kind = 'client' and l.client_id = v_key));

    if v_can_ban and v_count >= v_ban then
      v_until := case when p_ban_days > 0 then now() + make_interval(days => p_ban_days) else null end;
      insert into visitor_bans (kind, key_hash, scope, reason, banned_until, ip_hash)
        values (v_kind, v_key, p_scope, 'over_30_day_limit', v_until,
                case when v_kind = 'client' and p_ip_trusted then p_ip_hash else null end)
        on conflict (kind, key_hash, scope) do update
          set banned_at = now(), banned_until = excluded.banned_until, reason = excluded.reason,
              ip_hash = excluded.ip_hash;
      insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
        values (p_ip_hash, p_client_id, true, 'banned', p_scope);
      return query select false, 'banned'::text,
        case when v_until is null then 0 else greatest(1, ceil(extract(epoch from (v_until - now())))::int) end;
      return;
    end if;
  end loop;

  -- C) cooldown in progress for any subject?
  foreach v_kind in array array['client', 'ip'] loop
    if v_kind = 'client' and p_client_id is null then continue; end if;
    v_key := case when v_kind = 'ip' then p_ip_hash else p_client_id end;

    select max(l.created_at) into v_cd_at from chat_request_log l
      where l.scope = p_scope and l.reason = 'cooldown:' || v_kind
        and ((v_kind = 'ip' and l.ip_hash = v_key) or (v_kind = 'client' and l.client_id = v_key));
    if v_cd_at is not null and v_cd_at + make_interval(secs => p_cooldown_s) > now() then
      insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
        values (p_ip_hash, p_client_id, true, 'cooldown_active', p_scope);
      return query select false, 'cooldown'::text,
        greatest(1, ceil(extract(epoch from (v_cd_at + make_interval(secs => p_cooldown_s) - now())))::int);
      return;
    end if;
  end loop;

  -- D) burst per subject: answered requests since the later of (window start, end of last cooldown)
  foreach v_kind in array array['client', 'ip'] loop
    if v_kind = 'client' and p_client_id is null then continue; end if;
    v_key := case when v_kind = 'ip' then p_ip_hash else p_client_id end;
    v_burst := case when v_kind = 'ip' and (p_client_id is not null or not p_ip_trusted)
                    then p_burst_max * v_ip_mult else p_burst_max end;

    v_since := now() - make_interval(secs => p_burst_window_s);
    select max(l.created_at) into v_cd_at from chat_request_log l
      where l.scope = p_scope and l.reason = 'cooldown:' || v_kind
        and ((v_kind = 'ip' and l.ip_hash = v_key) or (v_kind = 'client' and l.client_id = v_key));
    if v_cd_at is not null and v_cd_at + make_interval(secs => p_cooldown_s) > v_since then
      v_since := v_cd_at + make_interval(secs => p_cooldown_s);
    end if;

    select count(*) into v_count from chat_request_log l
      where l.scope = p_scope and not l.blocked and l.created_at > v_since
        and ((v_kind = 'ip' and l.ip_hash = v_key) or (v_kind = 'client' and l.client_id = v_key));
    if v_count >= v_burst then
      insert into chat_request_log (ip_hash, client_id, blocked, reason, scope)
        values (p_ip_hash, p_client_id, true, 'cooldown:' || v_kind, p_scope);
      return query select false, 'cooldown'::text, p_cooldown_s;
      return;
    end if;
  end loop;

  -- E) site-wide daily budget (locked so parallel requests cannot overshoot it)
  perform pg_advisory_xact_lock(hashtext(p_scope || ':global'));
  select count(*) into v_count from chat_request_log l
    where l.scope = p_scope and not l.blocked and l.created_at > now() - interval '1 day';
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
    delete from chat_request_log l where l.created_at < now() - interval '45 days';
  end if;

  return query select true, null::text, 0;
end;
$$;

revoke all on function public.check_visitor_limit(text, text, text, int, int, int, int, int, int, int, boolean, int) from public, anon, authenticated;
grant execute on function public.check_visitor_limit(text, text, text, int, int, int, int, int, int, int, boolean, int) to service_role;

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

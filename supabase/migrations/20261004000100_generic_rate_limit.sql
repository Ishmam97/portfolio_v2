-- Generalise the chat rate limiter so other functions (contact form) can share the log table
-- without their traffic counting against the chat's global daily budget.

alter table public.chat_request_log add column if not exists scope text not null default 'chat';
create index if not exists chat_request_log_scope_idx on public.chat_request_log (scope, created_at desc);

drop function if exists public.check_chat_rate_limit(text, text, int, int, int, int, int);

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

  if random() < 0.01 then
    delete from chat_request_log where created_at < now() - interval '14 days';
  end if;

  return query select (v_reason is null), v_reason, v_retry;
end;
$$;

revoke all on function public.check_rate_limit(text, text, text, int, int, int, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, text, int, int, int, int, int) to service_role;

-- Per-visitor request log + atomic rate-limit check for the rag-chat edge function.
-- Only the service role (the edge function) can touch these; no public policies.

create table if not exists public.chat_request_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  client_id text,
  blocked boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists chat_request_log_ip_idx on public.chat_request_log (ip_hash, created_at desc);
create index if not exists chat_request_log_client_idx on public.chat_request_log (client_id, created_at desc);
create index if not exists chat_request_log_created_idx on public.chat_request_log (created_at desc);

alter table public.chat_request_log enable row level security;

create or replace function public.check_chat_rate_limit(
  p_ip_hash text,
  p_client_id text,
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
  -- serialize concurrent requests from the same IP so count + insert is atomic
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));

  -- per-IP windows (only requests that were allowed count)
  select count(*), min(created_at) into v_count, v_oldest
    from chat_request_log where ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 minute';
  if v_count >= p_ip_per_min then
    v_reason := 'ip_minute';
    v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 minute' - now())))::int);
  end if;

  if v_reason is null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log where ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 hour';
    if v_count >= p_ip_per_hour then
      v_reason := 'ip_hour';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::int);
    end if;
  end if;

  if v_reason is null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log where ip_hash = p_ip_hash and not blocked and created_at > now() - interval '1 day';
    if v_count >= p_ip_per_day then
      v_reason := 'ip_day';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 day' - now())))::int);
    end if;
  end if;

  -- per-browser window (catches one visitor rotating IPs)
  if v_reason is null and p_client_id is not null then
    select count(*), min(created_at) into v_count, v_oldest
      from chat_request_log where client_id = p_client_id and not blocked and created_at > now() - interval '1 hour';
    if v_count >= p_client_per_hour then
      v_reason := 'client_hour';
      v_retry := greatest(1, ceil(extract(epoch from (v_oldest + interval '1 hour' - now())))::int);
    end if;
  end if;

  -- global daily budget guard
  if v_reason is null then
    select count(*) into v_count from chat_request_log where not blocked and created_at > now() - interval '1 day';
    if v_count >= p_global_per_day then
      v_reason := 'global_day';
      v_retry := 3600;
    end if;
  end if;

  insert into chat_request_log (ip_hash, client_id, blocked, reason)
    values (p_ip_hash, p_client_id, v_reason is not null, v_reason);

  -- housekeeping: occasionally drop old rows
  if random() < 0.01 then
    delete from chat_request_log where created_at < now() - interval '14 days';
  end if;

  return query select (v_reason is null), v_reason, v_retry;
end;
$$;

revoke all on function public.check_chat_rate_limit(text, text, int, int, int, int, int) from public, anon, authenticated;
grant execute on function public.check_chat_rate_limit(text, text, int, int, int, int, int) to service_role;

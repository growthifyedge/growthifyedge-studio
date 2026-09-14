-- GrowthifyEdge Phase 4: asynchronous email notification for new inquiries.
--
-- Run only after Phase 2. This does not change submit_inquiry(), existing
-- inquiries, or RLS. The AFTER INSERT trigger queues an HTTP request only
-- after the inquiry row has committed; notification failure never rolls back
-- the inquiry.
--
-- Before running, create these Supabase Vault secrets:
--   inquiry_notification_function_url
--     https://<PROJECT-REF>.supabase.co/functions/v1/notify-inquiry
--   inquiry_notification_hook_secret
--     a long random value also configured as the Edge Function secret

create extension if not exists pg_net with schema extensions;

create or replace function public.queue_inquiry_notification()
returns trigger
language plpgsql
security definer
set search_path = public, vault, net
as $$
declare
  function_url text;
  hook_secret text;
  request_id bigint;
begin
  select decrypted_secret into function_url
  from vault.decrypted_secrets
  where name = 'inquiry_notification_function_url';

  select decrypted_secret into hook_secret
  from vault.decrypted_secrets
  where name = 'inquiry_notification_hook_secret';

  if coalesce(function_url, '') = '' or coalesce(hook_secret, '') = '' then
    raise warning 'GrowthifyEdge inquiry notification not queued: Vault configuration is missing (inquiry id %)', new.id;
    return new;
  end if;

  select net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-inquiry-hook-secret', hook_secret
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'id', new.id,
        'name', new.name,
        'email', new.email,
        'phone', new.phone,
        'company', new.company,
        'type', new.type,
        'project_name', new.project_name,
        'message', new.message,
        'created_at', new.created_at
      )
    )
  ) into request_id;

  return new;
exception when others then
  -- The inquiry is already stored. Keep it even if asynchronous notification
  -- configuration or queueing is unavailable; PostgreSQL records this warning.
  raise warning 'GrowthifyEdge inquiry notification was not queued for inquiry %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists inquiries_notify_email_after_insert on public.inquiries;
create trigger inquiries_notify_email_after_insert
after insert on public.inquiries
for each row execute function public.queue_inquiry_notification();

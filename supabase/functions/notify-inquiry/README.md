# `notify-inquiry` Edge Function

Sends a private email notification after a new `public.inquiries` row is
created. It is called by the Phase 4 database trigger, not by the Angular app.

## Required Edge Function secrets

Set these in **Supabase Dashboard → Edge Functions → Secrets** (or with the
Supabase CLI) before deploying:

| Secret | Value |
| --- | --- |
| `RESEND_API_KEY` | API key created in the Resend account |
| `RESEND_FROM_EMAIL` | A sender at a Resend-verified domain, for example `GrowthifyEdge <inquiries@growthifyedge.com>` |
| `INQUIRY_NOTIFICATION_HOOK_SECRET` | Long random value shared with the Vault secret of the same purpose |

The recipient is intentionally fixed in the function as `growthifyedge@gmail.com`.

## Required Vault secrets

In **Supabase Dashboard → SQL Editor**, create the two values referenced by
`phase4-inquiry-email-notifications.sql` without putting them in source code:

```sql
select vault.create_secret(
  'https://<PROJECT-REF>.supabase.co/functions/v1/notify-inquiry',
  'inquiry_notification_function_url'
);

select vault.create_secret(
  '<same long random value used for INQUIRY_NOTIFICATION_HOOK_SECRET>',
  'inquiry_notification_hook_secret'
);
```

`supabase/config.toml` disables the platform JWT check for this one function
because database triggers do not have a user JWT. Its mandatory private
hook-secret check is the protection. Deploy it with:

```bash
supabase functions deploy notify-inquiry
```

Then run `supabase/phase4-inquiry-email-notifications.sql` once in the SQL
Editor. The trigger is idempotent: re-running it replaces only this trigger and
queue function.

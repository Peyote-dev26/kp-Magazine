-- KP MAGAZINES API privilege fix.
-- Additive only: this migration grants table access without changing or disabling RLS.
-- Apply after 001_initial_schema.sql in the Supabase SQL editor.

-- The API roles need namespace access before table-level privileges can apply.
grant usage on schema public to anon, authenticated, service_role;

-- Public editorial reads are constrained by the existing RLS policies.
grant select on table public.articles, public.categories, public.authors to anon, authenticated;

-- Public forms may submit only the records covered by their INSERT policies.
grant insert on table public.newsletter_subscribers, public.contact_messages to anon, authenticated;

-- Profiles remain private: RLS limits these privileges to the current user's row.
grant select, update on table public.profiles to authenticated;

-- Existing article RLS policies limit authors and staff to permitted rows.
grant select, insert, update, delete on table public.articles to authenticated;

-- Existing comment and bookmark RLS policies limit member/moderator access.
grant insert, select, update, delete on table public.comments to authenticated;
grant select, insert, update, delete on table public.bookmarks to authenticated;

-- Staff-only reads are still controlled by the existing RLS policies.
grant select on table public.newsletter_subscribers, public.contact_messages, public.audit_logs to authenticated;

-- The trusted backend client gets only the operations used by backend workflows.
-- service_role remains server-side and is not exposed to browser clients.
grant select on table public.roles to service_role;
grant select, insert, update, delete on table public.categories to service_role;
grant select, insert, update, delete on table public.authors to service_role;
grant select, insert, update on table public.profiles to service_role;
grant select, insert, update, delete on table public.articles to service_role;
grant select on table public.comments, public.videos, public.homepage_sections to service_role;
grant select, insert, delete on table public.newsletter_subscribers to service_role;
grant select, insert, update, delete on table public.contact_messages to service_role;
grant select, insert on table public.audit_logs to service_role;
grant select, insert, update, delete on table public.subscriptions to service_role;

-- No sequence privileges are required: the schema uses UUID defaults and text keys,
-- not serial or identity columns.

-- Intentionally no anon/authenticated grants are provided for roles, subscriptions,
-- or audit_logs. auth.users is managed by Supabase and is not granted directly.

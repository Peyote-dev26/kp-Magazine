-- KP MAGAZINES Supabase schema.
-- This migration is additive and does not drop or reset existing objects.

create extension if not exists pgcrypto;

create table if not exists public.roles (
  name text primary key,
  description text not null default ''
);

insert into public.roles (name, description) values
  ('super_admin', 'Full platform access'),
  ('editor', 'Editorial management'),
  ('author', 'Own article management'),
  ('moderator', 'Comment moderation'),
  ('member', 'Registered member'),
  ('reader', 'Registered reader'),
  ('contributor', 'Community contributor')
on conflict (name) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'member' references public.roles(name),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.authors (
  id text primary key,
  name text not null,
  bio text not null default '',
  social jsonb not null default '{}'::jsonb,
  profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  title text not null,
  slug text unique not null,
  subtitle text not null default '',
  excerpt text not null default '',
  category_id text references public.categories(id) on delete set null,
  author_id text references public.authors(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  cover_image text,
  body text not null default '',
  featured boolean not null default false,
  trending boolean not null default false,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  scheduled_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  views integer not null default 0
);

create table if not exists public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public.articles(id) on delete cascade,
  editor_id uuid references public.profiles(id) on delete set null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table if not exists public.article_tags (
  article_id text not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists public.videos (
  id text primary key,
  title text not null,
  video_url text not null,
  category text not null default '',
  thumbnail text,
  description text not null default '',
  status text not null default 'published',
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  storage_path text not null,
  public_url text,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id text primary key,
  article_id text not null references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null default '',
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id text not null references public.comments(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  article_id text not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null default 0,
  interval text not null default 'month',
  active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text references public.subscription_plans(id) on delete set null,
  status text not null default 'pending',
  start_date timestamptz,
  renewal_date timestamptz,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.advertisements (
  id text primary key,
  name text not null,
  placement text not null,
  status text not null default 'active',
  destination_url text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id text primary key,
  name text not null,
  tier text not null default '',
  website text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  page_views integer not null default 0,
  user_registrations integer not null default 0,
  newsletter_registrations integer not null default 0,
  engagement numeric(5, 2) not null default 0
);

create table if not exists public.homepage_sections (
  id text primary key,
  type text not null,
  title text not null,
  article_id text references public.articles(id) on delete set null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.categories enable row level security;
alter table public.authors enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create policy "published articles are public" on public.articles for select using (status = 'published');
create policy "staff manage articles" on public.articles for all using (public.current_role() in ('super_admin', 'editor'));
create policy "authors manage own articles" on public.articles for all using (public.current_role() = 'author' and created_by = auth.uid());
create policy "public categories" on public.categories for select using (true);
create policy "public authors" on public.authors for select using (true);
create policy "members manage own bookmarks" on public.bookmarks for all using (user_id = auth.uid());
create policy "members create comments" on public.comments for insert with check (user_id = auth.uid());
create policy "staff moderate comments" on public.comments for all using (public.current_role() in ('super_admin', 'editor', 'moderator'));
create policy "users manage own profile" on public.profiles for select using (id = auth.uid());
create policy "users update own profile" on public.profiles for update using (id = auth.uid());
create policy "staff read subscribers" on public.newsletter_subscribers for select using (public.current_role() in ('super_admin', 'editor'));
create policy "public subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "staff read contacts" on public.contact_messages for select using (public.current_role() in ('super_admin', 'editor'));
create policy "public submit contacts" on public.contact_messages for insert with check (true);
create policy "staff read audit logs" on public.audit_logs for select using (public.current_role() in ('super_admin', 'editor'));

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'editor');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  page_key text not null default 'home',
  title text,
  summary text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.flow_stages (
  id uuid primary key default gen_random_uuid(),
  stage_key text not null unique,
  stage_order integer not null default 0,
  tag text,
  icon text,
  title text,
  summary text,
  what_text text,
  notices jsonb not null default '[]'::jsonb,
  confusion jsonb not null default '[]'::jsonb,
  can_do jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  resource_card_keys jsonb not null default '[]'::jsonb,
  social_work_tip text,
  next_step text,
  is_enabled boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.need_pages (
  id uuid primary key default gen_random_uuid(),
  need_key text not null unique,
  need_order integer not null default 0,
  icon text,
  title text,
  summary text,
  what_happens text,
  first_steps jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  resource_card_keys jsonb not null default '[]'::jsonb,
  phones jsonb not null default '[]'::jsonb,
  reminder text,
  is_enabled boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.resource_cards (
  id uuid primary key default gen_random_uuid(),
  card_key text not null unique,
  sort_order integer not null default 0,
  directory_group text not null default 'stability',
  visual_type text not null default 'support',
  kind text not null default 'service',
  category_key text,
  icon text,
  title text not null,
  subtitle text,
  summary text,
  tags jsonb not null default '[]'::jsonb,
  phone_label text,
  tel text,
  address text,
  website text,
  role_label text,
  description text,
  service_scope text,
  note text,
  is_enabled boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hotlines (
  id uuid primary key default gen_random_uuid(),
  hotline_key text not null unique,
  sort_order integer not null default 0,
  category text,
  badge text,
  title text not null,
  subtitle text,
  summary text,
  tel text not null,
  is_enabled boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at
before update on public.site_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_flow_stages_updated_at on public.flow_stages;
create trigger set_flow_stages_updated_at
before update on public.flow_stages
for each row execute function public.set_updated_at();

drop trigger if exists set_need_pages_updated_at on public.need_pages;
create trigger set_need_pages_updated_at
before update on public.need_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_resource_cards_updated_at on public.resource_cards;
create trigger set_resource_cards_updated_at
before update on public.resource_cards
for each row execute function public.set_updated_at();

drop trigger if exists set_hotlines_updated_at on public.hotlines;
create trigger set_hotlines_updated_at
before update on public.hotlines
for each row execute function public.set_updated_at();

alter table public.site_sections enable row level security;
alter table public.flow_stages enable row level security;
alter table public.need_pages enable row level security;
alter table public.resource_cards enable row level security;
alter table public.hotlines enable row level security;

drop policy if exists "public can read published site_sections" on public.site_sections;
create policy "public can read published site_sections"
on public.site_sections
for select
to anon, authenticated
using (is_enabled = true and is_published = true);

drop policy if exists "editors can read all site_sections" on public.site_sections;
create policy "editors can read all site_sections"
on public.site_sections
for select
to authenticated
using (public.is_editor());

drop policy if exists "editors can insert site_sections" on public.site_sections;
create policy "editors can insert site_sections"
on public.site_sections
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "editors can update site_sections" on public.site_sections;
create policy "editors can update site_sections"
on public.site_sections
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "admins can delete site_sections" on public.site_sections;
create policy "admins can delete site_sections"
on public.site_sections
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read published flow_stages" on public.flow_stages;
create policy "public can read published flow_stages"
on public.flow_stages
for select
to anon, authenticated
using (is_enabled = true and is_published = true);

drop policy if exists "editors can read all flow_stages" on public.flow_stages;
create policy "editors can read all flow_stages"
on public.flow_stages
for select
to authenticated
using (public.is_editor());

drop policy if exists "editors can insert flow_stages" on public.flow_stages;
create policy "editors can insert flow_stages"
on public.flow_stages
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "editors can update flow_stages" on public.flow_stages;
create policy "editors can update flow_stages"
on public.flow_stages
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "admins can delete flow_stages" on public.flow_stages;
create policy "admins can delete flow_stages"
on public.flow_stages
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read published need_pages" on public.need_pages;
create policy "public can read published need_pages"
on public.need_pages
for select
to anon, authenticated
using (is_enabled = true and is_published = true);

drop policy if exists "editors can read all need_pages" on public.need_pages;
create policy "editors can read all need_pages"
on public.need_pages
for select
to authenticated
using (public.is_editor());

drop policy if exists "editors can insert need_pages" on public.need_pages;
create policy "editors can insert need_pages"
on public.need_pages
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "editors can update need_pages" on public.need_pages;
create policy "editors can update need_pages"
on public.need_pages
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "admins can delete need_pages" on public.need_pages;
create policy "admins can delete need_pages"
on public.need_pages
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read published resource_cards" on public.resource_cards;
create policy "public can read published resource_cards"
on public.resource_cards
for select
to anon, authenticated
using (is_enabled = true and is_published = true);

drop policy if exists "editors can read all resource_cards" on public.resource_cards;
create policy "editors can read all resource_cards"
on public.resource_cards
for select
to authenticated
using (public.is_editor());

drop policy if exists "editors can insert resource_cards" on public.resource_cards;
create policy "editors can insert resource_cards"
on public.resource_cards
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "editors can update resource_cards" on public.resource_cards;
create policy "editors can update resource_cards"
on public.resource_cards
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "admins can delete resource_cards" on public.resource_cards;
create policy "admins can delete resource_cards"
on public.resource_cards
for delete
to authenticated
using (public.is_admin());

drop policy if exists "public can read published hotlines" on public.hotlines;
create policy "public can read published hotlines"
on public.hotlines
for select
to anon, authenticated
using (is_enabled = true and is_published = true);

drop policy if exists "editors can read all hotlines" on public.hotlines;
create policy "editors can read all hotlines"
on public.hotlines
for select
to authenticated
using (public.is_editor());

drop policy if exists "editors can insert hotlines" on public.hotlines;
create policy "editors can insert hotlines"
on public.hotlines
for insert
to authenticated
with check (public.is_editor());

drop policy if exists "editors can update hotlines" on public.hotlines;
create policy "editors can update hotlines"
on public.hotlines
for update
to authenticated
using (public.is_editor())
with check (public.is_editor());

drop policy if exists "admins can delete hotlines" on public.hotlines;
create policy "admins can delete hotlines"
on public.hotlines
for delete
to authenticated
using (public.is_admin());

-- KW Listings: schema + seed data
-- Run this in your Supabase project's SQL editor.

-- ────────────────────────────────────────────────────────────────────
-- TYPES
-- ────────────────────────────────────────────────────────────────────
create type listing_stage as enum (
  'pre_list', 'photos', 'staging', 'mls', 'marketing',
  'live', 'pending', 'closed'
);

create type task_status as enum ('todo', 'doing', 'done', 'blocked');

create type activity_kind as enum (
  'listing_created', 'stage_changed', 'task_created',
  'task_completed', 'task_due_changed', 'comment_added',
  'subscribed', 'unsubscribed'
);

-- ────────────────────────────────────────────────────────────────────
-- PEOPLE (lightweight — auth.users handles the heavy lift)
-- ────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'agent', -- 'admin' | 'agent' | 'intern'
  avatar_color text not null default '#A6A6A6',
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────
-- LISTINGS
-- ────────────────────────────────────────────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  nickname text, -- e.g. "Ridgeglen"
  city text not null,
  state text not null default 'CA',
  zip text,
  price_cents bigint, -- list price
  beds smallint,
  baths numeric(3,1),
  sqft int,
  stage listing_stage not null default 'pre_list',
  list_date date,
  target_live_date date,
  seller_name text,
  cover_image_url text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_stage_idx on public.listings (stage);
create index listings_owner_idx on public.listings (owner_id);

-- ────────────────────────────────────────────────────────────────────
-- TASKS (dated work-items per listing — the timeline)
-- ────────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  due_at timestamptz,
  duration_minutes int default 60,
  assignee_id uuid references public.profiles(id) on delete set null,
  -- categorizes task into a swimlane (e.g. 'photos','staging','marketing')
  category text,
  created_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_listing_idx on public.tasks (listing_id);
create index tasks_due_idx on public.tasks (due_at);

-- ────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ────────────────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_listing_idx on public.comments (listing_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS (people watching a listing)
-- ────────────────────────────────────────────────────────────────────
create table public.subscriptions (
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

-- ────────────────────────────────────────────────────────────────────
-- ACTIVITY LOG (audit trail for the realtime feed)
-- ────────────────────────────────────────────────────────────────────
create table public.activity (
  id bigserial primary key,
  listing_id uuid references public.listings(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind activity_kind not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activity_listing_idx on public.activity (listing_id, created_at desc);
create index activity_created_idx on public.activity (created_at desc);

-- ────────────────────────────────────────────────────────────────────
-- TRIGGERS — auto-log activity
-- ────────────────────────────────────────────────────────────────────
create or replace function log_listing_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity (listing_id, actor_id, kind, payload)
    values (new.id, new.owner_id, 'listing_created',
            jsonb_build_object('address', new.address, 'nickname', new.nickname));
  elsif (tg_op = 'UPDATE' and old.stage is distinct from new.stage) then
    insert into public.activity (listing_id, actor_id, kind, payload)
    values (new.id, new.owner_id, 'stage_changed',
            jsonb_build_object('from', old.stage, 'to', new.stage));
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_activity
after insert or update on public.listings
for each row execute function log_listing_change();

create or replace function log_task_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity (listing_id, actor_id, kind, payload)
    values (new.listing_id, new.created_by, 'task_created',
            jsonb_build_object('title', new.title, 'due_at', new.due_at));
  elsif (tg_op = 'UPDATE') then
    if old.status is distinct from new.status and new.status = 'done' then
      insert into public.activity (listing_id, actor_id, kind, payload)
      values (new.listing_id, new.assignee_id, 'task_completed',
              jsonb_build_object('title', new.title));
    elsif old.due_at is distinct from new.due_at then
      insert into public.activity (listing_id, actor_id, kind, payload)
      values (new.listing_id, new.assignee_id, 'task_due_changed',
              jsonb_build_object('title', new.title, 'from', old.due_at, 'to', new.due_at));
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tasks_activity
after insert or update on public.tasks
for each row execute function log_task_change();

create or replace function log_comment_added() returns trigger as $$
begin
  insert into public.activity (listing_id, actor_id, kind, payload)
  values (new.listing_id, new.author_id, 'comment_added',
          jsonb_build_object('snippet', left(new.body, 80)));
  return new;
end;
$$ language plpgsql;

create trigger comments_activity
after insert on public.comments
for each row execute function log_comment_added();

-- ────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — permissive for v0 demo (tighten later)
-- ────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activity enable row level security;

-- Anyone signed in can read everything (v0 demo simplicity)
create policy "auth read profiles" on public.profiles for select using (auth.role() = 'authenticated');
create policy "auth read listings" on public.listings for select using (auth.role() = 'authenticated');
create policy "auth read tasks" on public.tasks for select using (auth.role() = 'authenticated');
create policy "auth read comments" on public.comments for select using (auth.role() = 'authenticated');
create policy "auth read subs" on public.subscriptions for select using (auth.role() = 'authenticated');
create policy "auth read activity" on public.activity for select using (auth.role() = 'authenticated');

-- Anyone signed in can write (v0 — in prod restrict to admin/owner)
create policy "auth write listings" on public.listings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write tasks" on public.tasks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write comments" on public.comments for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "own subscriptions" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.activity;

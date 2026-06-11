-- Demo seed data. Run AFTER 0001_init.sql.
-- Creates a few profiles + 6 listings (including "Ridgeglen") with tasks
-- so the app has something to show on first boot.

-- Profiles (created via auth.users is the real flow — for demo seed we insert directly)
-- NOTE: in a real Supabase project, sign up users via /auth/sign-up first, then
-- update their profiles row with their full_name. The IDs below are placeholders
-- you should swap for real auth.users IDs after signup.

-- Insert demo listings with hardcoded owners = null for now
-- (the UI handles null owners gracefully; once you sign up, edit listings to assign yourself)

insert into public.listings
  (address, nickname, city, state, zip, price_cents, beds, baths, sqft,
   stage, list_date, target_live_date, seller_name, cover_image_url)
values
  ('1842 Ridgeglen Dr', 'Ridgeglen', 'San Jose', 'CA', '95124',
   1895000, 4, 3.0, 2410, 'photos', current_date - 4, current_date + 10,
   'The Hayashi family',
   'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80'),

  ('27 Oak Knoll Ln', 'Oak Knoll', 'Los Gatos', 'CA', '95032',
   3250000, 5, 4.5, 3800, 'staging', current_date - 1, current_date + 14,
   'Patel Estate',
   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'),

  ('413 Mission Hill Rd', 'Mission Hill', 'Saratoga', 'CA', '95070',
   2475000, 3, 2.5, 2050, 'mls', current_date - 8, current_date + 3,
   'Greg & Ana Lewis',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'),

  ('906 Magnolia Ct', 'Magnolia', 'Cupertino', 'CA', '95014',
   1650000, 3, 2.0, 1620, 'pre_list', null, current_date + 21,
   'Jennifer Wu',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'),

  ('1201 Crestview Dr', 'Crestview', 'Palo Alto', 'CA', '94303',
   4150000, 5, 4.0, 3450, 'live', current_date - 15, current_date - 5,
   'Sarah Donovan',
   'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80'),

  ('64 Belmont Pl', 'Belmont', 'Mountain View', 'CA', '94040',
   2150000, 4, 3.0, 2200, 'pending', current_date - 28, current_date - 18,
   'The Okafor family',
   'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80');

-- Tasks for Ridgeglen (the example Alan called out)
with l as (select id from public.listings where nickname = 'Ridgeglen')
insert into public.tasks (listing_id, title, status, due_at, duration_minutes, category)
select l.id, t.title, t.status::task_status, t.due_at, t.duration, t.category from l, (values
  ('Pre-listing walkthrough',     'done',  (current_date - 3)::timestamptz + interval '10 hour', 90,  'pre_list'),
  ('Stager site visit',           'done',  (current_date - 2)::timestamptz + interval '14 hour', 60,  'staging'),
  ('Photography — exterior + drone', 'doing', (current_date + 1)::timestamptz + interval '09 hour', 120, 'photos'),
  ('Photography — interior',      'todo',  (current_date + 1)::timestamptz + interval '13 hour', 180, 'photos'),
  ('Twilight photos',             'todo',  (current_date + 2)::timestamptz + interval '17 hour 30 minute', 60, 'photos'),
  ('Floor plan + measurements',   'todo',  (current_date + 2)::timestamptz + interval '11 hour', 90,  'photos'),
  ('Marketing copy draft',        'todo',  (current_date + 4)::timestamptz + interval '10 hour', 120, 'marketing'),
  ('MLS data entry',              'todo',  (current_date + 6)::timestamptz + interval '09 hour', 60,  'mls'),
  ('Sign install',                'todo',  (current_date + 7)::timestamptz + interval '11 hour', 30,  'marketing'),
  ('Broker tour',                 'todo',  (current_date + 9)::timestamptz + interval '10 hour', 120, 'marketing'),
  ('Open house — Sat',            'todo',  (current_date + 10)::timestamptz + interval '13 hour', 180, 'marketing')
) as t(title, status, due_at, duration, category);

-- A few tasks for Oak Knoll
with l as (select id from public.listings where nickname = 'Oak Knoll')
insert into public.tasks (listing_id, title, status, due_at, duration_minutes, category)
select l.id, t.title, t.status::task_status, t.due_at, t.duration, t.category from l, (values
  ('Stager furniture delivery',   'doing', (current_date + 1)::timestamptz + interval '08 hour', 240, 'staging'),
  ('Photography',                 'todo',  (current_date + 4)::timestamptz + interval '10 hour', 180, 'photos'),
  ('MLS entry',                   'todo',  (current_date + 7)::timestamptz + interval '09 hour', 60,  'mls')
) as t(title, status, due_at, duration, category);

-- Mission Hill tasks
with l as (select id from public.listings where nickname = 'Mission Hill')
insert into public.tasks (listing_id, title, status, due_at, duration_minutes, category)
select l.id, t.title, t.status::task_status, t.due_at, t.duration, t.category from l, (values
  ('MLS data entry',              'done',  (current_date - 1)::timestamptz + interval '10 hour', 60,  'mls'),
  ('Broker open',                 'todo',  (current_date + 2)::timestamptz + interval '11 hour', 120, 'marketing'),
  ('Public open house',           'todo',  (current_date + 3)::timestamptz + interval '13 hour', 180, 'marketing')
) as t(title, status, due_at, duration, category);

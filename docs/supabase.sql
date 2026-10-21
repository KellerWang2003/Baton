-- Baton: persistent captures. Paste into Supabase > SQL Editor > New query > Run.
-- Prototype setup: no sign-in. Each browser has a random device_id, kept in localStorage.

create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  created_at timestamptz not null default now(),
  photo_path text,
  question text,
  note text not null default '',
  category text check (category in ('feeling', 'people', 'places')),
  place text,
  prompt_number int,
  time_label text,
  x real,
  y real,
  size real
);

create index if not exists captures_device_idx on public.captures (device_id, created_at);

alter table public.captures enable row level security;

-- Anyone with the anon key can add, read and delete rows (prototype only; the app filters by device_id).
drop policy if exists "captures insert" on public.captures;
drop policy if exists "captures select" on public.captures;
drop policy if exists "captures delete" on public.captures;
create policy "captures insert" on public.captures for insert to anon with check (true);
create policy "captures select" on public.captures for select to anon using (true);
create policy "captures delete" on public.captures for delete to anon using (true);

-- Photo storage
insert into storage.buckets (id, name, public)
values ('capture-photos', 'capture-photos', true)
on conflict (id) do nothing;

drop policy if exists "capture photos insert" on storage.objects;
drop policy if exists "capture photos select" on storage.objects;
drop policy if exists "capture photos delete" on storage.objects;
create policy "capture photos insert" on storage.objects for insert to anon with check (bucket_id = 'capture-photos');
create policy "capture photos select" on storage.objects for select to anon using (bucket_id = 'capture-photos');
create policy "capture photos delete" on storage.objects for delete to anon using (bucket_id = 'capture-photos');

-- Archive data (cities' photo clouds and their opened moments), so it can be edited in
-- Table Editor instead of living in the code. Safe to run again.
alter table public.captures add column if not exists city text not null default 'la';
alter table public.captures add column if not exists moment_photo text;
alter table public.captures add column if not exists tilt real;
alter table public.captures add column if not exists one_line boolean;
alter table public.captures add column if not exists sort int;
alter table public.captures add column if not exists seed_key text unique;
-- photo_path is the circle in the cloud and moment_photo the opened photo (empty: the same one).
-- Either is a path in the capture-photos bucket, or a link, or a file in the app's public folder
-- such as /archive/la-cloud/21.jpg. A row with a note (and question) opens as a moment when tapped.
-- Rows with a seed_key are the original archive; "Clear my saved captures" leaves them alone.

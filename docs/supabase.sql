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

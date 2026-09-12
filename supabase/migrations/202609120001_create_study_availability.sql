-- Study availability data model
-- Run this entire file in Supabase Dashboard → SQL Editor.
-- This app intentionally has no login. The policies below permit link visitors
-- to collaborate with the publishable/anon key; do not use a service_role key.

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.availability (
  id bigint generated always as identity primary key,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  participant_name text not null check (char_length(trim(participant_name)) between 1 and 80),
  slot smallint not null check (slot >= 0 and slot < 336),
  created_at timestamptz not null default now(),
  unique (meeting_id, participant_name, slot)
);

create index if not exists availability_meeting_slot_idx
  on public.availability (meeting_id, slot);

create index if not exists availability_meeting_participant_idx
  on public.availability (meeting_id, participant_name);

alter table public.meetings enable row level security;
alter table public.availability enable row level security;

drop policy if exists "meeting links can read meetings" on public.meetings;
drop policy if exists "meeting links can create meetings" on public.meetings;
drop policy if exists "meeting links can update meetings" on public.meetings;
drop policy if exists "meeting links can delete meetings" on public.meetings;
drop policy if exists "meeting links can read availability" on public.availability;
drop policy if exists "meeting links can create availability" on public.availability;
drop policy if exists "meeting links can update availability" on public.availability;
drop policy if exists "meeting links can delete availability" on public.availability;

-- Link-based collaboration: anyone with the app link can read and edit.
create policy "meeting links can read meetings" on public.meetings
  for select to anon, authenticated using (true);
create policy "meeting links can create meetings" on public.meetings
  for insert to anon, authenticated with check (true);
create policy "meeting links can update meetings" on public.meetings
  for update to anon, authenticated using (true) with check (true);
create policy "meeting links can delete meetings" on public.meetings
  for delete to anon, authenticated using (true);

create policy "meeting links can read availability" on public.availability
  for select to anon, authenticated using (true);
create policy "meeting links can create availability" on public.availability
  for insert to anon, authenticated with check (true);
create policy "meeting links can update availability" on public.availability
  for update to anon, authenticated using (true) with check (true);
create policy "meeting links can delete availability" on public.availability
  for delete to anon, authenticated using (true);

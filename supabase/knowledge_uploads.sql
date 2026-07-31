-- Run this once in the Supabase SQL editor to enable the Admin Upload feature.
-- Dashboard → SQL Editor → paste → Run.

create table if not exists public.knowledge_uploads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  target text not null default 'ai-decide',
  filename text,
  created_at timestamptz not null default now()
);

alter table public.knowledge_uploads enable row level security;

-- The site uses the anon key. These policies let the app read, insert, and
-- delete knowledge documents. (The upload page itself is gated by a passcode.)
create policy "knowledge read"   on public.knowledge_uploads for select using (true);
create policy "knowledge insert" on public.knowledge_uploads for insert with check (true);
create policy "knowledge delete" on public.knowledge_uploads for delete using (true);

-- Run once in the Supabase SQL editor (same project as knowledge_uploads).
-- Stores structured, published additions that render on the site itself
-- (e.g. new bylaw sections), as opposed to knowledge_uploads which is raw
-- context for the AI tools.

create table if not exists public.content_additions (
  id uuid primary key default gen_random_uuid(),
  target text not null,          -- 'bylaws', 'quick-reference', ...
  data jsonb not null,           -- structured entry in that section's format
  source_title text,
  created_at timestamptz not null default now()
);

alter table public.content_additions enable row level security;

create policy "additions read"   on public.content_additions for select using (true);
create policy "additions insert" on public.content_additions for insert with check (true);
create policy "additions delete" on public.content_additions for delete using (true);

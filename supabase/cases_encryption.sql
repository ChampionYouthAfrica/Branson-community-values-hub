-- Run once in the Supabase SQL editor (branson-dei-notes project).
-- Adds the columns Case Notes encryption needs. Existing rows keep working
-- (they upgrade automatically the next time they are saved).

alter table public.cases add column if not exists salt text;
alter table public.cases add column if not exists passcode_hash text;

-- The plaintext passcode column is no longer written for new cases and is
-- nulled out when an old case is next saved. (Left in place so existing rows
-- remain readable until they upgrade; you may drop it later once all cases
-- show a salt.)
-- alter table public.cases drop column passcode;

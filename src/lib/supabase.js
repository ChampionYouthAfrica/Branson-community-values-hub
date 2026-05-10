import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://hzjcfsrehlgtmjzythes.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6amNmc3JlaGxndG1qenl0aGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MzgzMDQsImV4cCI6MjA5NDAxNDMwNH0.Cw2JXxRK1CqdOD6PxI3MVrOG3o-O94Mnim-3G-zeAfE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

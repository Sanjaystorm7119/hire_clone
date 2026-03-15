hireAva_1-main/
└── supabase/
    └── migrations/
        └── 20240315_enable_rls.sql   ← create this file

-- supabase/migrations/20240315_enable_rls.sql

<!-- -- USERS -->
alter table public."Users" enable row level security;
create policy "users_own_record" on public."Users"
  for all using (email = current_setting('app.user_email', true));

<!-- -- INTERVIEWS -->
alter table public.interviews enable row level security;
create policy "interviews_own_record" on public.interviews
  for all using ("userEmail" = current_setting('app.user_email', true));
-- Public read for candidate-facing pages
create policy "interviews_public_read" on public.interviews
  for select using (true);

<!-- -- INTERVIEW FEEDBACK -->
alter table public."interview-feedback" enable row level security;
create policy "feedback_own_record" on public."interview-feedback"
  for all using ("userEmail" = current_setting('app.user_email', true));

<!-- -- RESUMES -->
alter table public.resumes enable row level security;
create policy "resumes_own_record" on public.resumes
  for all using ("userEmail" = current_setting('app.user_email', true));

<!-- -- JOB DESCRIPTIONS -->
alter table public.job_descriptions enable row level security;
create policy "jd_own_record" on public.job_descriptions
  for all using ("userEmail" = current_setting('app.user_email', true));

<!-- -- CANDIDATE JOB MATCHES -->
alter table public.candidate_job_matches enable row level security;
create policy "matches_own_record" on public.candidate_job_matches
  for all using ("userEmail" = current_setting('app.user_email', true));

npx supabase db push


<!-- sample implementation : example -->

// lib/supabase.jsx — update your client setup
import { createClient } from '@supabase/supabase-js'

// Use this in API routes (server-side only — uses service role)
export const getSupabaseWithUser = (userEmail) => {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // service role, not anon key
  )
  
  // Set the user context so RLS policies can read it
  client.rpc('set_config', {
    setting: 'app.user_email',
    value: userEmail,
    is_local: true
  })
  
  return client
}

<!--api route example implementation -->
// app/api/any-route/route.js
import { getAuth } from '@clerk/nextjs/server'
import { getSupabaseWithUser } from '@/lib/supabase'

export async function GET(req) {
  const { userId } = getAuth(req)
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user email from your Users table or Clerk
  const userEmail = req.headers.get('x-user-email') // or fetch from Clerk

  const supabase = getSupabaseWithUser(userEmail)
  
  // Now all queries are automatically filtered by RLS
  const { data } = await supabase.from('interviews').select('*')
  // ^ only returns THIS user's interviews
}

###special case 

<!--  -->

-- Candidates can READ an interview by its public ID (no auth needed)
create policy "Public read access for interview by ID"
on public.interviews
for select
using (true);  -- anyone can read, but your app only exposes it via interview_id URL
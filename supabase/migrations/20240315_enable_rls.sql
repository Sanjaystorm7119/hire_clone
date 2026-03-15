-- RLS Policies for HireEva
-- Run via: npx supabase db push
-- Requires SUPABASE_SERVICE_ROLE_KEY for server-side API routes.

-- ── USERS ────────────────────────────────────────────────────────────────────
alter table public."Users" enable row level security;

create policy "users_own_record" on public."Users"
  for all using (email = current_setting('app.user_email', true));

-- ── INTERVIEWS ───────────────────────────────────────────────────────────────
alter table public.interviews enable row level security;

create policy "interviews_own_record" on public.interviews
  for all using ("userEmail" = current_setting('app.user_email', true));

-- Candidates can read any interview by its public interviewId (no auth needed)
create policy "interviews_public_read" on public.interviews
  for select using (true);

-- ── INTERVIEW FEEDBACK ───────────────────────────────────────────────────────
alter table public."interview-feedback" enable row level security;

create policy "feedback_own_record" on public."interview-feedback"
  for all using ("userEmail" = current_setting('app.user_email', true));

-- ── RESUMES ──────────────────────────────────────────────────────────────────
alter table public.resumes enable row level security;

create policy "resumes_own_record" on public.resumes
  for all using ("userEmail" = current_setting('app.user_email', true));

-- ── JOB DESCRIPTIONS ─────────────────────────────────────────────────────────
alter table public.job_descriptions enable row level security;

create policy "jd_own_record" on public.job_descriptions
  for all using ("userEmail" = current_setting('app.user_email', true));

-- ── CANDIDATE JOB MATCHES ────────────────────────────────────────────────────
alter table public.candidate_job_matches enable row level security;

create policy "matches_own_record" on public.candidate_job_matches
  for all using ("userEmail" = current_setting('app.user_email', true));

-- ── INTERVIEW INVITES ────────────────────────────────────────────────────────
alter table public.interview_invites enable row level security;

-- Recruiters manage their own invites
create policy "invites_own_record" on public.interview_invites
  for all using (
    interview_id in (
      select "interviewId" from public.interviews
      where "userEmail" = current_setting('app.user_email', true)
    )
  );

-- ── CALL LOGS ────────────────────────────────────────────────────────────────
-- call_logs has no userEmail; restrict to service role only (no anon access)
alter table public.call_logs enable row level security;
-- No policy means anon/authenticated roles are denied by default.
-- Only the service role (used by API routes) can read/write call_logs.

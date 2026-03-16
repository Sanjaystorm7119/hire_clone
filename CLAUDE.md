# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests (single run)
npm run test:watch   # Run Jest tests in watch mode
```

To run a single test file:
```bash
npx jest "app/(main)/dashboard/_components/Welcome.test.jsx"
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENROUTER_API_KEY=
VAPI_API_KEY=
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_HOST_URL=
```

## Frontend / Backend Separation

The codebase is split into `frontend/` and `backend/` support folders alongside the Next.js `app/` directory (which must remain at root for Next.js).

```
hireAva_1-main/
├── app/                                    # Next.js App Router (must stay at root)
│   ├── api/                                # ← BACKEND: API route handlers
│   │   ├── aimodel/route.jsx              #   Generates interview questions (OpenRouter + Gemini)
│   │   ├── ai-feedback/route.jsx          #   Generates candidate feedback ratings
│   │   ├── company-summary/route.jsx      #   Generates company intro for Vapi
│   │   ├── save-transcript/route.js       #   Fetches & saves Vapi transcript to Supabase
│   │   ├── parse-document/route.js        #   Extracts job info from PDF/DOCX via LLM (max 2 MB)
│   │   ├── parse-resume/route.js          #   Extracts candidate info from PDF/DOCX via LLM (max 2 MB)
│   │   ├── resume-match/route.js          #   AI resume-to-JD match scoring; saves to candidate_job_matches
│   │   └── users/route.tsx               #   Syncs Clerk user to Supabase Users table
│   ├── (auth)/                             # ← FRONTEND: Clerk sign-in/sign-up pages
│   │   ├── sign-in/[[...sign-in]]/page.jsx
│   │   └── sign-up/[[...sign-up]]/page.jsx
│   ├── (main)/                             # ← FRONTEND: Authenticated dashboard routes
│   │   ├── layout.jsx                     #   Secondary bg, p-10 padding, wraps DashboardProvider
│   │   ├── provider.jsx                   #   DashboardProvider — SidebarProvider + AppSideBar + Welcome
│   │   ├── _components/
│   │   │   └── AppsideBar.jsx             #   Sidebar: dark navy (#0F172A), amber accents, 3 NAV_GROUPS (Main/Talent/Account), user footer
│   │   ├── dashboard/page.jsx             #   Renders DashboardStats + LatestInterviewsList
│   │   ├── dashboard/_components/
│   │   │   ├── Welcome.jsx                #   Greeting banner: time-based greeting + 7 rotating AI tips (day-of-week)
│   │   │   ├── Welcome.test.jsx
│   │   │   ├── DashboardStats.jsx         #   4 metric cards: Interviews Created, Completed, Candidates Evaluated, Avg Score
│   │   │   ├── CreateOptions.jsx          #   2-column grid: Create Interview + Phone Screening (coming soon) — not used in dashboard/page.jsx
│   │   │   ├── InterviewCard.jsx          #   Card: company avatar (hash-colored), position, duration, candidates, copy/send link
│   │   │   ├── InterviewCard.test.jsx
│   │   │   └── LatestInterviewsList.jsx   #   Fetches last 6 interviews with candidate counts
│   │   ├── dashboard/create-interview/page.jsx   #   3-step wizard (FormContainer → QuestionList → InterviewLink)
│   │   ├── dashboard/create-interview/_components/
│   │   │   ├── FormContainer.jsx          #   Step 1: job details form with PDF/DOCX auto-fill
│   │   │   ├── FormContainer.test.jsx
│   │   │   ├── QuestionList.jsx           #   Step 2: AI questions (drag-drop reorder, add/remove); saves interview + JD to bank
│   │   │   ├── QuestionList.test.jsx
│   │   │   └── InterviewLink.jsx          #   Step 3: shareable candidate link + copy/email/Slack/WhatsApp
│   │   ├── scheduled-interview/page.jsx   #   Interview list with search (position/company), paginated
│   │   ├── scheduled-interview/[interview_id]/details/page.jsx
│   │   ├── scheduled-interview/_components/
│   │   │   ├── CandidateList.jsx          #   Candidate list with min/max rating filter (1-10)
│   │   │   ├── CandidateList.test.jsx
│   │   │   ├── CandidateFeedbackDialogBox.jsx    #   Modal: ratings, summary, recommendation
│   │   │   ├── CandidateTranscriptDialogBox.js   #   Modal: chat-format transcript with stats
│   │   │   └── InterviewdetailContainer.jsx      #   Interview details + edit mode + company summary
│   │   ├── all-interview/page.jsx         #   All interviews paginated (6/page) with InterviewCard grid
│   │   ├── resume-bank/page.jsx           #   Multi-upload resumes; 6-filter client-side search; paginated grid
│   │   ├── job-details-bank/page.jsx      #   Multi-upload JDs; 4-filter client-side search; paginated grid
│   │   ├── resume-matcher/page.jsx        #   Resume-to-JD AI match scoring UI with match history
│   │   └── settings/page.jsx             #   User info card + Clerk UserButton + custom sign-out
│   ├── interview/                          # ← FRONTEND: Candidate-facing interview flow
│   │   ├── layout.jsx
│   │   ├── [interview_id]/page.jsx        #   Join/landing: checklist, duplicate-attempt guard
│   │   ├── [interview_id]/start/page.jsx  #   Live voice interview with Vapi
│   │   ├── [interview_id]/start/_components/
│   │   │   └── AlertConfirmation.jsx      #   End-interview confirmation dialog
│   │   ├── [interview_id]/completed/page.jsx     #   Success screen with confetti (50 pieces, 3s) + "What Happens Next?" steps
│   │   └── _components/
│   │       └── InterviewHeader.jsx        #   Eva logo linking to dashboard
│   ├── auth/                               # ← FRONTEND: Public landing page
│   │   ├── page.jsx                       #   Dark-theme landing: Navbar + animated InterviewMockup hero + feature cards + Footer
│   │   ├── Hero1.jsx                      #   Disabled (returns null)
│   │   ├── Hero1.test.jsx
│   │   ├── Hero1.css
│   │   └── Footer.jsx                     #   Dark footer: 3-column layout, About dialog (company values), social links, serif wordmark bg
│   ├── unauthorized/page.jsx
│   ├── not-found.jsx                      #   404 page with navigation shortcuts
│   ├── layout.jsx                          # Root layout (ClerkProvider + Geist fonts + Sonner)
│   ├── page.jsx                            # Home → renders auth/page.jsx (landing)
│   ├── provider.jsx                        # Root provider: syncs Clerk user to Supabase on login
│   └── globals.css
├── frontend/                               # Frontend-only support files
│   ├── components/ui/                      # Shadcn/Radix UI components (new-york style)
│   │   ├── 3d-card.jsx                    #   Perspective 3D card (used in InterviewCard)
│   │   ├── alert-dialog.jsx
│   │   ├── button.jsx + button.test.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx / label.jsx / textarea.jsx / select.jsx
│   │   ├── LiquidChrome.jsx + LiquidChrome.css   # Custom canvas 3D liquid animation (exists but no longer used in landing)
│   │   ├── progress.jsx / separator.jsx / skeleton.jsx
│   │   ├── sheet.jsx / sidebar.jsx / tabs.jsx / tooltip.jsx
│   │   └── sonner.jsx                     # Toast notification wrapper
│   ├── context/
│   │   └── InterviewDataContext.jsx        # createContext() only — state lives in page components
│   ├── hooks/
│   │   └── use-mobile.js                   # useIsMobile() — viewport ≤ 767px via matchMedia
│   ├── lib/
│   │   └── utils.js                        # cn() utility (clsx + tailwind-merge)
│   └── constants/
│       ├── uiConstants.js                  # SidebarOptions, InterviewTypes (5), interviewPrompt()
│       └── (no other files)
├── backend/                                # Backend-only support files
│   └── constants/
│       ├── aiPrompts.js                    # QUESTIONS_PROMPT, FEEDBACK prompt templates
│       └── aiModels.js                     # Centralized AI model ID constants
├── lib/
│   ├── supabase.jsx                        # Shared Supabase anon client (throws if env vars missing)
│   └── utils.js                            # cn() utility (duplicate of frontend/lib/utils.js)
├── __mocks__/
│   └── @clerk/nextjs.js                    # Clerk mocks for Jest tests
├── middleware.ts                           # Clerk auth middleware (protects all non-public routes)
├── next.config.mjs                         # Allows img.clerk.com for user avatars
├── jsconfig.json                           # Path aliases
├── tsconfig.json                           # TS config (allowJs: true, strict: false)
├── jest.config.js                          # Jest config (jsdom, 10s timeout)
├── jest.setup.js                           # Jest setup (mocks: Supabase, Clerk, Vapi, Next)
├── test-utils.js                           # render() wrapper with ClerkProvider
├── components.json                         # Shadcn CLI config (new-york, JSX, slate)
└── public/                                 # Static assets (must stay at root)
```

### Path Aliases (`jsconfig.json`)

```js
@/*          → project root       // e.g. @/lib/supabase
@frontend/*  → ./frontend/*      // e.g. @frontend/components/ui/button
@backend/*   → ./backend/*       // e.g. @backend/constants/aiPrompts
```

All existing `app/` files use relative paths to reach `frontend/` or `backend/`. For new code, prefer the `@frontend/*` and `@backend/*` aliases.

---

## Architecture Overview

**HireEva** is an AI-powered interview platform. Recruiters create interview sessions; candidates are interviewed by a voice AI named "Eva"; AI generates structured feedback. A separate **resume/JD matching subsystem** lets recruiters upload resumes and job descriptions and score them against each other.

---

### Interview Lifecycle

1. **Create** (`/dashboard/create-interview`) — 3-step wizard:
   - Step 1 (`FormContainer`): Job position, description, duration, type (multi-select), company name/details. Supports PDF/DOCX upload via `POST /api/parse-document` (mammoth for DOCX, base64 for PDF → Gemma 3n extracts fields). Defaults: 10 min, [Technical, Behavioral, Experience] types. Text inputs debounced 300–600ms.
   - Step 2 (`QuestionList`): Calls `POST /api/aimodel` → OpenRouter → Gemini 2.5 Flash Lite generates one question per minute of duration; drag-and-drop reorder via `@dnd-kit`. Add/remove questions. On "Create Interview Link": saves to `interviews` table **and** mirrors job details to `job_descriptions` table (linked via `interview_id`).
   - Step 3 (`InterviewLink`): Displays shareable candidate link (`{HOST_URL}/{interviewId}`). Share via copy, email, Slack, WhatsApp buttons.

2. **Conduct** (`/interview/[interview_id]/start`) — Candidate joins; `@vapi-ai/web` powers a live voice session.
   - Vapi configured with `interviewPrompt()` as system prompt (Eva persona).
   - Interview state machine: `ready → briefing → questions → ended`.
   - Countdown timer from duration with expiration warning (does not auto-end — allows candidate to finish); mic mute/unmute toggle.
   - Tracks conversation in state; replaces programming operators with TTS-friendly words (e.g. `===` → "triple equals").
   - Tracks interruption frequency and timeout management.
   - On `call-end`: calls `POST /api/ai-feedback`, saves feedback JSON to `interview-feedback` table. Retries on 429.
   - On tab close mid-call: `navigator.sendBeacon` attempts transcript save.

3. **Feedback** (`/interview/[interview_id]/completed`) — Transcript sent to `POST /api/ai-feedback`; Gemini 2.5 Flash returns ratings (1–10) for technical skills, communication, problem-solving, experience, and overall, plus hire/no-hire recommendation. Saved to Supabase `interview-feedback`. Completion page shows confetti animation (50 pieces, 3 s) and "What Happens Next?" steps section.

4. **Review** (`/scheduled-interview/[interview_id]/details`) — Recruiter views all candidates, transcripts (`CandidateTranscriptDialogBox` — chat format with stats), and AI feedback (`CandidateFeedbackDialogBox` — progress bars + recommendation). `CandidateList` has min/max rating filter (1–10). `InterviewdetailContainer` supports full edit mode (position, description, questions, duration, types, company details).

---

### Resume/JD Matching Subsystem

1. **Resume Bank** (`/resume-bank`) — Multi-file upload of PDF/DOCX resumes via `POST /api/parse-resume`. Stored in Supabase `resumes` table. Client-side multi-filter (6 filters — see Filter section). Paginated grid (6/page).

2. **Job Description Bank** (`/job-details-bank`) — Multi-file upload via `POST /api/parse-document`. Auto-populated when a new interview is created (linked via `interview_id`). Client-side multi-filter (4 filters). Paginated grid (6/page).

3. **Resume Matcher** (`/resume-matcher`) — Select a resume and a JD, call `POST /api/resume-match`. Returns confidence score (0–100), skills/experience/semantic sub-scores, matched skills, and missing skills. Results saved to `candidate_job_matches` table. Color-coded: ≥70% green, ≥40% yellow, <40% red. Shows last 20 match history.

---

### Resume Bank — 6 Filters (client-side AND logic)

| Filter | Searches |
|---|---|
| Role | `parsed_data.current_role` + `parsed_data.experience_summary` |
| Tech stack | `parsed_data.skills` array (full text) |
| Location | `parsed_data.location` |
| Degree | Dropdown: Bachelor's / Master's / PhD / Associate's / High School — matches `parsed_data.degree` or `parsed_data.education` |
| College | `parsed_data.college` + `parsed_data.education` |
| Experience (years) | Min/Max number inputs; `parseYears()` reads lower bound from `years_of_experience` string; max ≥ 30 treated as no upper cap |

Filters reset pagination to page 1 on change. "Clear all" button appears when any filter is active.

### Job Details Bank — 4 Filters (client-side AND logic)

| Filter | Searches |
|---|---|
| Company | `parsed_data.company_name` |
| Role | `role_title` column |
| Experience keyword | Full text across `role_title` + `raw_text` + `parsed_data.job_description` |
| Interview type | Multi-pill select: Technical / Behavioral / Experience / Problem Solving / Leadership — matches `parsed_data.interview_types` array (only present on records created from create-interview) |

---

### API Routes

| Route | Purpose | Model |
|---|---|---|
| `POST /api/aimodel` | Generate interview questions (1 per minute of duration) | `google/gemini-2.5-flash-lite` |
| `POST /api/ai-feedback` | Generate candidate feedback (ratings 1–10 + recommendation) | `google/gemini-2.5-flash` |
| `POST /api/company-summary` | Generate TTS-friendly company intro for Vapi persona | `google/gemini-2.5-flash-lite` |
| `POST /api/save-transcript` | Fetch transcript from Vapi API (`/v1/calls/{callId}/transcript`), filter conversation-update items, save to Supabase | — |
| `POST /api/parse-document` | Extract job fields from PDF/DOCX (max 2 MB); returns company_name, company_details, job_position, job_description | `google/gemma-3n-e2b-it:free` |
| `POST /api/parse-resume` | Extract candidate info from PDF/DOCX (max 2 MB); returns name, email, skills, experience_summary, education, years_of_experience, current_role, location, degree, college | `google/gemma-3n-e2b-it:free` |
| `POST /api/resume-match` | Score resume vs. JD; save to `candidate_job_matches` | `google/gemini-2.5-flash-lite` |
| `POST /api/users` | Upsert Clerk user into Supabase `Users` table by email | — |

Model IDs are defined in `backend/constants/aiModels.js` — update there to change models globally.

---

### Page Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.jsx` | Renders auth landing page |
| `/auth` | `app/auth/page.jsx` | Dark-theme public landing: animated InterviewMockup + feature cards + Footer |
| `/sign-in` | `app/(auth)/sign-in/...` | Clerk sign-in |
| `/sign-up` | `app/(auth)/sign-up/...` | Clerk sign-up |
| `/dashboard` | `app/(main)/dashboard/page.jsx` | Recruiter dashboard (DashboardStats + LatestInterviewsList) |
| `/dashboard/create-interview` | `app/(main)/dashboard/create-interview/page.jsx` | 3-step interview creation |
| `/scheduled-interview` | `app/(main)/scheduled-interview/page.jsx` | Interview list (search by position/company, paginated) |
| `/scheduled-interview/[id]/details` | `...details/page.jsx` | Candidates, transcripts, feedback, edit interview |
| `/all-interview` | `app/(main)/all-interview/page.jsx` | All interviews paginated (6/page) |
| `/resume-bank` | `app/(main)/resume-bank/page.jsx` | Multi-upload + 6-filter browse of candidate resumes |
| `/job-details-bank` | `app/(main)/job-details-bank/page.jsx` | Multi-upload + 4-filter browse of job descriptions |
| `/resume-matcher` | `app/(main)/resume-matcher/page.jsx` | AI resume-to-JD match scoring + history |
| `/settings` | `app/(main)/settings/page.jsx` | User info + Clerk UserButton + sign-out |
| `/interview/[id]` | `app/interview/[interview_id]/page.jsx` | Candidate join/landing (duplicate-attempt guard) |
| `/interview/[id]/start` | `app/interview/[interview_id]/start/page.jsx` | Live Vapi voice interview |
| `/interview/[id]/completed` | `app/interview/[interview_id]/completed/page.jsx` | Post-interview confetti success screen |
| `/unauthorized` | `app/unauthorized/page.jsx` | Access denied |

---

### Key Integrations

| Concern | Library/Service | Notes |
|---|---|---|
| Auth | `@clerk/nextjs` — `middleware.ts` protects all non-public routes | v^6.23.3 |
| Database | `@supabase/supabase-js` — anon client in `lib/supabase.jsx` | v^2.50.2; security via RLS + userEmail filters |
| AI/LLM | OpenRouter API | Gemini 2.5 Flash Lite (questions, matching, summary), Gemini 2.5 Flash (feedback), Gemma 3n (doc/resume parse) |
| Voice | `@vapi-ai/web` — live interview; Eva persona built from `interviewPrompt()` | v^2.3.8 |
| UI components | Shadcn/ui (new-york style) + Radix UI primitives in `frontend/components/ui/` | — |
| Animations | `framer-motion` v^12.23.0 + `motion` v^12.19.2 | Landing page uses `motion/react` import from `motion` package |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` — question reordering in `QuestionList` | v^6.3.1 |
| Notifications | `sonner` toasts | v^2.0.5 |
| Icons | `lucide-react` v^0.525.0 + `@tabler/icons-react` v^3.34.0 | tabler used in start/page.jsx (IconPhoneEnd) |
| Document parsing | `mammoth` — DOCX → plain text | v^1.12.0 |
| HTTP client | `axios` — used in `QuestionList` and `start/page.jsx` | v^1.10.0 |
| Date formatting | `moment` — used in `CandidateList` | v^2.30.1 |
| Styling | Tailwind CSS v4 + `clsx` + `tailwind-merge` + `tw-animate-css` | Landing/footer use inline CSS-in-JS with CSS custom properties |
| Unique IDs | `uuid` v^11.1.0 | Available for use |
| OpenAI SDK | `openai` v^5.8.2 | In dependencies (usage context: OpenRouter-compatible client) |
| 3D/WebGL | `ogl` v^1.0.11 | In dependencies |
| E2E Testing | `@playwright/test` v^1.58.2 | Dev dependency (no tests written yet) |

---

### State Management

React Context only — no Redux or Zustand:
- `frontend/context/InterviewDataContext.jsx` — `createContext()` only; actual state lives in individual page components (interview flow).
- `app/(main)/provider.jsx` — `SidebarProvider` wraps dashboard layout.
- All other state: local `useState`/`useCallback`/`useMemo` in each page.

---

### Supabase Tables

| Table | Key Columns | Used By |
|---|---|---|
| `interviews` | `interviewId`, `userEmail`, `jobPosition`, `jobDescription`, `companyName`, `companyDetails`, `duration`, `type` (JSON array), `questionList` (JSON array), `companySummary`, `created_at` | Create flow, dashboard, review |
| `interview-feedback` | `userEmail`, `userName`, `interview_Id`, `feedback` (JSON: ratings + summary + recommendation), `transcript` (JSON), `call_id`, `created_at` | Feedback generation, transcript display |
| `Users` | `email`, `clerk_user_id`, `name`, `picture`, `firstname`, `lastname`, `credits`, `created_at` | Synced on every login via `app/provider.jsx` |
| `resumes` | `id`, `userEmail`, `candidate_name`, `candidate_email`, `parsed_data` (JSON: skills, experience_summary, education, years_of_experience, current_role, location, degree, college), `created_at` | Resume bank, resume matcher |
| `job_descriptions` | `id`, `userEmail`, `role_title`, `raw_text`, `parsed_data` (JSON: company_name, company_details, job_position, job_description, interview_types, duration), `interview_id` (optional FK), `created_at` | JD bank, resume matcher |
| `candidate_job_matches` | `id`, `userEmail`, `resume_id`, `jd_id`, `confidence_score`, `skills_score`, `experience_score`, `semantic_score`, `matched_skills` (array), `missing_skills` (array), `created_at` | Resume matcher |

**Security rule**: All client-side delete/update queries must include `.eq("userEmail", userEmail)` alongside `.eq("id", id)` to prevent IDOR.

---

### AI Prompt Outputs

**`QUESTIONS_PROMPT`** (`backend/constants/aiPrompts.js`):
Returns JSON: `{ interviewQuestions: [{ question: string, type: "Technical | Behavioral | Experience | Problem Solving | Leadership" }] }`
Exactly one question per minute of interview duration.

**`FEEDBACK`** (`backend/constants/aiPrompts.js`):
Returns JSON:
```json
{
  "rating": {
    "technicalSkills": 1-10,
    "communicationSkills": 1-10,
    "problemSolving": 1-10,
    "experience": 1-10,
    "OverallRating": 1-10
  },
  "summary": ["...", "...", "...", "...", "..."],
  "Recommendation": "recommended | not recommended",
  "RecommendationMessage": "short lowercase reason"
}
```
If interview < 60 seconds, returns low default ratings.

**Resume match prompt** (inline in `resume-match/route.js`):
Returns JSON: `{ confidence_score, skills_score, experience_score, semantic_score, matched_skills, missing_skills, summary }`

**`parse-resume` prompt** (`app/api/parse-resume/route.js`, inline):
Returns JSON: `{ candidate_name, candidate_email, skills[], experience_summary, education, years_of_experience, current_role, location, degree, college }`

**`parse-document` prompt** (`app/api/parse-document/route.js`, inline):
Returns JSON: `{ company_name, company_details, job_position, job_description }`

**`company-summary` prompt** (`app/api/company-summary/route.jsx`, inline):
Returns JSON: `{ summary: string }` — 3 paragraphs max, 3 sentences each, TTS-safe (no symbols, spells out numbers).

---

### Auth Middleware (`middleware.ts`)

Public routes (no auth): `/sign-in.*`, `/sign-up.*`, `/`
All others: protected via `auth.protect()`. Matcher skips Next.js internals and static files; always runs for `/api` and `/trpc`.

---

### Known Implementation Details & Gotchas

1. **`interview-feedback` column name**: The column is `interview_Id` (capital I) in Supabase — `save-transcript/route.js` uses this exact casing. Keep consistent when querying.

2. **Interview creation → JD bank sync**: `QuestionList.onFinish()` inserts into both `interviews` and `job_descriptions` (with `interview_id` FK and `parsed_data.interview_types` array). Uploading a JD directly does not set `interview_types` or `duration` in `parsed_data`.

3. **`parse-resume` extracted fields**: `current_role`, `location`, `degree`, `college` were added recently. Older resume records in Supabase will not have these in `parsed_data` — filters for those fields simply won't match old records.

4. **Debouncing in FormContainer**: Manual debounce using `useCallback` + `useMemo` (no external library). Different delays per field (300–600ms).

5. **Vapi TTS symbol replacement**: `start/page.jsx` replaces operators before sending to Vapi (`===` → "triple equals", `>=` → "greater than or equal to", etc.) to avoid TTS mispronunciation.

6. **Transcript save resilience**: Two code paths — primary via `POST /api/save-transcript`, fallback via `navigator.sendBeacon` on `beforeunload`.

7. **Credits system**: `Users` table has a `credits` column. `QuestionList.onFinish()` decrements credits by 1 using read-then-update (not atomic). `onGoToNext()` in `CreateInterview` blocks if `user.credits <= 0`.

8. **`InterviewDataContext`**: Just a bare `createContext()` — no Provider or default value shipped. State management is page-local.

9. **Hero1.jsx**: Exists but returns `null`. Legacy landing page code preserved but disabled.

10. **`app/page.jsx`**: Does not redirect — it renders `app/auth/page.jsx` component directly. Route is `/` (public).

11. **`all-interview` vs `scheduled-interview`**: Both list interviews for the recruiter. `all-interview` is paginated with no search. `scheduled-interview` has search + links to per-interview details/candidates.

12. **IDOR prevention**: Every Supabase client-side delete/update must chain `.eq("userEmail", userEmail)`. API routes re-fetch with userEmail filter before processing (see `resume-match/route.js`).

13. **Dashboard page**: Renders `DashboardStats` + `LatestInterviewsList`. `CreateOptions.jsx` still exists but is **not imported** by `dashboard/page.jsx` — it is unused.

14. **DashboardStats**: Fetches two Supabase queries in parallel — `interviews` (count) and `interview-feedback` (feedback JSON). Calculates avg from `feedback.rating.OverallRating`. Shows `—` while loading.

15. **Welcome component tips**: Array of 7 tips; selected by `new Date().getDay() % 7`. Time-based greeting switches at 12:00 (morning → afternoon) and 17:00 (afternoon → evening).

16. **Sidebar navigation groups**: `NAV_GROUPS` config with 3 groups — `Main` (Dashboard, Scheduled Interviews, All Interviews), `Talent` (Resume Bank, Job Details Bank, Resume Matcher), `Account` (Settings). Active item highlighted with amber (#F59E0B) dot + tinted background.

17. **Landing page redesign**: `app/auth/page.jsx` is a dark-theme page (--pg-bg: #07070A) using `motion/react` from the `motion` package (not `framer-motion`). Features animated `InterviewMockup` component with waveforms, live scoring bars, rotating interview questions. `LiquidChrome.jsx` still exists in `frontend/components/ui/` but is no longer used here.

18. **Styling conventions**: Dashboard components use inline style objects with a warm neutral palette (white cards, #EDE8DF borders, amber accents). Landing page and Footer use injected `<style>` tags with CSS custom properties (--pg-* variables) and "DM Sans" + "Instrument Serif" Google Fonts.

---

### Testing

Jest 30 + React Testing Library 16. Mocks for Clerk in `__mocks__/@clerk/nextjs.js`. Test files co-located with components (`.test.jsx` suffix). `test-utils.js` provides a `render()` wrapper with `ClerkProvider`.

All test mocks (Supabase, Clerk keys, Vapi keys, Next.js Image, useRouter, usePathname, useSearchParams) are set up in `jest.setup.js`.

Playwright (`@playwright/test`) is installed as a dev dependency but no E2E tests have been written yet.

```bash
# Run all tests
npm run test

# Run a single file (quote the path — parentheses need escaping on some shells)
npx jest "app/(main)/dashboard/_components/Welcome.test.jsx"
```

Test files:
- `app/(main)/dashboard/_components/Welcome.test.jsx`
- `app/(main)/dashboard/_components/InterviewCard.test.jsx`
- `app/(main)/dashboard/create-interview/_components/FormContainer.test.jsx`
- `app/(main)/dashboard/create-interview/_components/QuestionList.test.jsx`
- `app/(main)/scheduled-interview/_components/CandidateList.test.jsx`
- `app/auth/Hero1.test.jsx`
- `frontend/components/ui/button.test.jsx`

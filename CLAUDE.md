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
npx jest app/dashboard/_components/Welcome.test.jsx
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
│   │   ├── layout.jsx
│   │   ├── provider.jsx                   #   DashboardProvider (SidebarProvider wrapper)
│   │   ├── _components/
│   │   │   └── AppsideBar.jsx
│   │   ├── dashboard/page.jsx
│   │   ├── dashboard/_components/
│   │   │   ├── Welcome.jsx
│   │   │   ├── Welcome.test.jsx
│   │   │   ├── CreateOptions.jsx
│   │   │   ├── InterviewCard.jsx
│   │   │   ├── InterviewCard.test.jsx
│   │   │   └── LatestInterviewsList.jsx
│   │   ├── dashboard/create-interview/page.jsx
│   │   ├── dashboard/create-interview/_components/
│   │   │   ├── FormContainer.jsx          #   Step 1: job details form
│   │   │   ├── FormContainer.test.jsx
│   │   │   ├── QuestionList.jsx           #   Step 2: generated questions (drag-drop reorder)
│   │   │   ├── QuestionList.test.jsx
│   │   │   └── InterviewLink.jsx          #   Step 3: shareable candidate link
│   │   ├── scheduled-interview/page.jsx
│   │   ├── scheduled-interview/[interview_id]/details/page.jsx
│   │   ├── scheduled-interview/_components/
│   │   │   ├── CandidateList.jsx          #   Candidate list with rating filter (1-10)
│   │   │   ├── CandidateList.test.jsx
│   │   │   ├── CandidateFeedbackDialogBox.jsx
│   │   │   ├── CandidateTranscriptDialogBox.js
│   │   │   └── InterviewdetailContainer.jsx
│   │   ├── all-interview/page.jsx
│   │   ├── resume-bank/page.jsx           #   Upload & browse candidate resumes
│   │   ├── job-details-bank/page.jsx      #   Upload & browse job descriptions
│   │   ├── resume-matcher/page.jsx        #   AI resume-to-JD match scoring UI
│   │   └── settings/page.jsx
│   ├── interview/                          # ← FRONTEND: Candidate-facing interview flow
│   │   ├── layout.jsx
│   │   ├── [interview_id]/page.jsx        #   Join/landing page
│   │   ├── [interview_id]/start/page.jsx  #   Live voice interview with Vapi
│   │   ├── [interview_id]/start/_components/
│   │   │   └── AlertConfirmation.jsx
│   │   ├── [interview_id]/completed/page.jsx
│   │   └── _components/
│   │       └── InterviewHeader.jsx
│   ├── auth/                               # ← FRONTEND: Public landing page
│   │   ├── page.jsx
│   │   ├── Hero1.jsx
│   │   ├── Hero1.test.jsx
│   │   ├── Hero1.css
│   │   └── Footer.jsx
│   ├── unauthorized/page.jsx
│   ├── not-found.jsx
│   ├── layout.jsx                          # Root layout (ClerkProvider + Sonner)
│   ├── page.jsx                            # Home (redirects to /auth)
│   ├── provider.jsx                        # Root provider (syncs Clerk user to Supabase)
│   └── globals.css
├── frontend/                               # Frontend-only support files
│   ├── components/ui/                      # Shadcn/Radix UI components (new-york style)
│   │   ├── 3d-card.jsx
│   │   ├── alert-dialog.jsx
│   │   ├── button.jsx + button.test.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── input.jsx / label.jsx / textarea.jsx / select.jsx
│   │   ├── LiquidChrome.jsx + LiquidChrome.css   # Custom 3D visual effect
│   │   ├── progress.jsx / separator.jsx / skeleton.jsx
│   │   ├── sheet.jsx / sidebar.jsx / tabs.jsx / tooltip.jsx
│   │   └── sonner.jsx                     # Toast notification wrapper
│   ├── context/
│   │   └── InterviewDataContext.jsx        # Interview data through interview flow
│   ├── hooks/
│   │   └── use-mobile.js                   # useIsMobile() — viewport <= 767px
│   ├── lib/
│   │   └── utils.js                        # cn() utility (clsx + tailwind-merge)
│   └── constants/
│       └── uiConstants.js                  # SidebarOptions, InterviewTypes, interviewPrompt()
├── backend/                                # Backend-only support files
│   └── constants/
│       ├── aiPrompts.js                    # QUESTIONS_PROMPT, FEEDBACK prompt templates
│       └── aiModels.js                     # Centralized AI model ID constants
├── lib/
│   ├── supabase.jsx                        # Shared Supabase anon client
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

## Architecture Overview

**HireEva** is an AI-powered interview platform. Recruiters create sessions; candidates are interviewed by a voice AI ("Eva"); AI generates structured feedback. A separate **resume/JD matching subsystem** lets recruiters upload resumes and job descriptions and score them against each other.

### Interview Lifecycle

1. **Create** (`/dashboard/create-interview`) — 3-step wizard:
   - Step 1 (`FormContainer`): Job position, description, duration, type, company details. Supports PDF/DOCX upload via `POST /api/parse-document` (mammoth for DOCX, base64 for PDF → Gemma 3n extracts fields).
   - Step 2 (`QuestionList`): Calls `POST /api/aimodel` → OpenRouter → Gemini 2.5 Flash Lite generates one question per minute of duration; drag-and-drop reorder via `@dnd-kit`.
   - Step 3 (`InterviewLink`): Shareable candidate link saved to Supabase `interviews` table with unique `interviewId`.

2. **Conduct** (`/interview/[interview_id]/start`) — Candidate joins; `@vapi-ai/web` powers a live voice session with the "Eva" AI persona using the pre-generated questions (`interviewPrompt()` from `frontend/constants/uiConstants.js`). Timer counts down, mic controls shown. On end: `POST /api/save-transcript`.

3. **Feedback** (`/interview/[interview_id]/completed`) — Transcript sent to `POST /api/ai-feedback`; Gemini 2.5 Flash returns ratings (1–10) for technical skills, communication, problem-solving, experience, and overall, plus a hire/no-hire recommendation. Saved to Supabase `interview-feedback` table.

4. **Review** (`/scheduled-interview/[interview_id]/details`) — Recruiter views all candidates, transcripts (`CandidateTranscriptDialogBox`), and AI feedback (`CandidateFeedbackDialogBox`). `CandidateList` has a min/max rating filter (1–10).

### Resume/JD Matching Subsystem

1. **Resume Bank** (`/resume-bank`) — Upload PDF/DOCX resumes via `POST /api/parse-resume` (Gemma 3n extracts name, email, skills, experience, education). Stored in Supabase `resumes` table. Paginated grid (6/page) with expandable cards.

2. **Job Description Bank** (`/job-details-bank`) — Upload PDF/DOCX job descriptions via `POST /api/parse-document`. Stored in Supabase `job_descriptions` table. Paginated grid with expandable previews.

3. **Resume Matcher** (`/resume-matcher`) — Select a resume and a job description, then call `POST /api/resume-match`. Returns confidence score (0–100), skills/experience/semantic sub-scores, matched skills, and missing skills. Results saved to `candidate_job_matches` table and shown with color-coded confidence (≥70% green, ≥40% yellow, <40% red).

### API Routes

| Route | Purpose | Model |
|---|---|---|
| `POST /api/aimodel` | Generate interview questions | `google/gemini-2.5-flash-lite` |
| `POST /api/ai-feedback` | Generate candidate feedback (ratings 1–10 + recommendation) | `google/gemini-2.5-flash` |
| `POST /api/company-summary` | Generate company intro text for Vapi persona | `google/gemini-2.5-flash-lite` |
| `POST /api/save-transcript` | Fetch transcript from Vapi API, save to Supabase | — |
| `POST /api/parse-document` | Extract job fields from PDF/DOCX upload (max 2 MB) | `google/gemma-3n-e2b-it:free` |
| `POST /api/parse-resume` | Extract candidate info from PDF/DOCX resume (max 2 MB) | `google/gemma-3n-e2b-it:free` |
| `POST /api/resume-match` | Score resume vs. job description; save to candidate_job_matches | `google/gemini-2.5-flash-lite` |
| `POST /api/users` | Sync Clerk user to Supabase `Users` table | — |

Model IDs are defined in `backend/constants/aiModels.js` — update there to change models globally.

### Page Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.jsx` | Redirects to `/auth` |
| `/auth` | `app/auth/page.jsx` | Public landing/hero page |
| `/sign-in` | `app/(auth)/sign-in/...` | Clerk sign-in |
| `/sign-up` | `app/(auth)/sign-up/...` | Clerk sign-up |
| `/dashboard` | `app/(main)/dashboard/page.jsx` | Recruiter dashboard |
| `/dashboard/create-interview` | `app/(main)/dashboard/create-interview/page.jsx` | 3-step interview creation |
| `/scheduled-interview` | `app/(main)/scheduled-interview/page.jsx` | Interview list (search by position/company) |
| `/scheduled-interview/[id]/details` | `...details/page.jsx` | Candidates, transcripts, feedback |
| `/all-interview` | `app/(main)/all-interview/page.jsx` | All interviews (paginated) |
| `/resume-bank` | `app/(main)/resume-bank/page.jsx` | Upload & browse candidate resumes |
| `/job-details-bank` | `app/(main)/job-details-bank/page.jsx` | Upload & browse job descriptions |
| `/resume-matcher` | `app/(main)/resume-matcher/page.jsx` | AI resume-to-JD match scoring |
| `/settings` | `app/(main)/settings/page.jsx` | Settings |
| `/interview/[id]` | `app/interview/[interview_id]/page.jsx` | Candidate join/landing |
| `/interview/[id]/start` | `app/interview/[interview_id]/start/page.jsx` | Live voice interview |
| `/interview/[id]/completed` | `app/interview/[interview_id]/completed/page.jsx` | Post-interview |
| `/unauthorized` | `app/unauthorized/page.jsx` | Access denied |

### Key Integrations

| Concern | Library/Service | Version |
|---|---|---|
| Auth | `@clerk/nextjs` — `middleware.ts` protects all non-public routes | ^6.23.3 |
| Database | `@supabase/supabase-js` — anon client in `lib/supabase.jsx` | ^2.50.2 |
| AI/LLM | OpenRouter API — Gemini 2.5 Flash Lite (questions, matching, company summary), Gemini 2.5 Flash (feedback), Gemma 3n (doc/resume parse) | — |
| Voice | `@vapi-ai/web` — live interview; Eva persona prompt in `frontend/constants/uiConstants.js` | ^2.3.8 |
| UI components | Shadcn/ui (new-york style) + Radix UI primitives in `frontend/components/ui/` | — |
| Animations | `framer-motion` | ^12.23.0 |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` — question reordering in `QuestionList` | ^6.3.1 |
| Notifications | `sonner` toasts | ^2.0.5 |
| Icons | `lucide-react` | ^0.525.0 |
| Document parsing | `mammoth` — DOCX → plain text | ^1.12.0 |
| Styling | Tailwind CSS v4 + `clsx` + `tailwind-merge` | ^4 |

### State Management

React Context only — no Redux or Zustand:
- `frontend/context/InterviewDataContext.jsx` — passes interview data through the interview flow

### Supabase Tables

| Table | Key Columns | Used By |
|---|---|---|
| `interviews` | `interviewId`, `userEmail`, `jobPosition`, `jobDescription`, `companyName`, `companyDetails`, `duration`, `type`, `questionList`, `created_at` | Create flow, dashboard, review |
| `interview-feedback` | `userEmail`, `userName`, `feedback` (JSON with ratings), `transcript`, `call_id`, `created_at` | Completed interviews, review page |
| `Users` | `clerk_user_id`, `email`, `name`, `picture`, `firstname`, `lastname`, `created_at` | Synced on every login via `app/provider.jsx` |
| `resumes` | `id`, `userEmail`, `candidate_name`, `candidate_email`, `parsed_data` (JSON: skills, experience_summary, education, years_of_experience), `created_at` | Resume bank, resume matcher |
| `job_descriptions` | `id`, `userEmail`, `role_title`, `raw_text`, `parsed_data` (JSON), `interview_id` (optional), `created_at` | JD bank, resume matcher |
| `candidate_job_matches` | `id`, `userEmail`, `resume_id`, `jd_id`, `confidence_score`, `skills_score`, `experience_score`, `semantic_score`, `matched_skills`, `missing_skills`, `created_at` | Resume matcher |

All client-side delete/update queries must include `.eq("userEmail", userEmail)` alongside `.eq("id", id)` to prevent IDOR.

### AI Prompt Outputs

**`QUESTIONS_PROMPT`** (→ `aiPrompts.js`):
Returns JSON array: `[{ question: string, type: "Technical | Behavioral | Experience | Problem Solving | Leadership" }]`
Exactly one question per minute of interview duration.

**`FEEDBACK`** (→ `aiPrompts.js`):
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

### Auth Middleware (`middleware.ts`)

Public routes (no auth): `/sign-in.*`, `/sign-up.*`, `/`
All others: protected. Matcher skips Next.js internals and static files; always runs for `/api` and `/trpc`.

### Testing

Jest 30 + React Testing Library 16. Mocks for Clerk in `__mocks__/@clerk/nextjs.js`. Test files co-located with components (`.test.jsx` suffix). `test-utils.js` provides a `render()` wrapper with `ClerkProvider`.

All test mocks (Supabase U  , Clerk keys, Vapi keys, Next.js Image, useRouter, usePathname, useSearchParams) are set up in `jest.setup.js`.

```bash
# Run all tests
npm run test

# Run a single file
npx jest app/(main)/dashboard/_components/Welcome.test.jsx
```

Test files:
- `app/(main)/dashboard/_components/Welcome.test.jsx`
- `app/(main)/dashboard/_components/InterviewCard.test.jsx`
- `app/(main)/dashboard/create-interview/_components/FormContainer.test.jsx`
- `app/(main)/dashboard/create-interview/_components/QuestionList.test.jsx`
- `app/(main)/scheduled-interview/_components/CandidateList.test.jsx`
- `app/auth/Hero1.test.jsx`
- `frontend/components/ui/button.test.jsx`

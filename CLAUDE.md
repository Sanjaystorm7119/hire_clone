# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
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
├── app/                        # Next.js App Router (must stay at root)
│   ├── api/                    # ← BACKEND: API route handlers
│   │   ├── aimodel/route.jsx         # Generates interview questions (OpenRouter + Gemini)
│   │   ├── ai-feedback/route.jsx     # Generates candidate feedback (OpenRouter + Gemini)
│   │   ├── company-summary/route.jsx # Generates company intro text
│   │   ├── save-transcript/route.js  # Fetches & saves Vapi transcript to Supabase
│   │   └── users/route.tsx           # Syncs Clerk user to Supabase Users table
│   ├── (auth)/                 # ← FRONTEND: Clerk sign-in/sign-up pages
│   ├── (main)/                 # ← FRONTEND: Authenticated dashboard routes
│   ├── interview/              # ← FRONTEND: Candidate-facing interview flow
│   └── ...
├── frontend/                   # Frontend-only support files
│   ├── components/ui/          # Shadcn/Radix UI components
│   ├── context/                # React contexts (InterviewDataContext, userDetailsContext, theme)
│   ├── hooks/                  # use-mobile.js
│   ├── lib/utils.js            # cn() utility (clsx + tailwind-merge)
│   └── constants/
│       └── uiConstants.js      # SidebarOptions, InterviewTypes, interviewPrompt
├── backend/                    # Backend-only support files
│   └── constants/
│       └── aiPrompts.js        # QUESTIONS_PROMPT, FEEDBACK (AI prompt strings)
├── lib/
│   └── supabase.jsx            # Shared Supabase anon client (used by both client components & API routes)
└── public/                     # Static assets (must stay at root)
```

### Path Aliases (`jsconfig.json`)

```js
@/*          → project root       // e.g. @/lib/supabase
@frontend/*  → ./frontend/*      // e.g. @frontend/components/ui/button
@backend/*   → ./backend/*       // e.g. @backend/constants/aiPrompts
```

All existing `app/` files use relative paths to reach `frontend/` or `backend/`. For new code, prefer the `@frontend/*` and `@backend/*` aliases.

## Architecture Overview

**HireEva** is an AI-powered interview platform. Recruiters create sessions; candidates are interviewed by a voice AI ("Eva"); AI generates structured feedback.

### Interview Lifecycle

1. **Create** (`/dashboard/create-interview`) — Recruiter fills a form; frontend calls `POST /api/aimodel` → OpenRouter → Gemini 2.0 Flash generates questions; result saved to Supabase `interviews` table with a unique `interviewId`.
2. **Conduct** (`/interview/[interview_id]/start`) — Candidate joins; `@vapi-ai/web` powers a live voice session with the "Eva" AI persona using the pre-generated questions (`interviewPrompt` from `frontend/constants/uiConstants.js`).
3. **Feedback** (`/interview/[interview_id]/completed`) — Transcript sent to `POST /api/ai-feedback`; Gemini returns ratings (1–10) for technical, communication, problem-solving, experience, and overall, plus a hire/no-hire recommendation.
4. **Review** (`/scheduled-interview/[interview_id]/details`) — Recruiter views all candidates, transcripts, and AI feedback.

### Key Integrations

| Concern | Library/Service |
|---|---|
| Auth | `@clerk/nextjs` — wraps the app in `ClerkProvider` (root layout); `app/provider.jsx` syncs Clerk users to Supabase `Users` table on every login |
| Database | `@supabase/supabase-js` — client in `lib/supabase.jsx` (public anon key, used by both client pages and API routes) |
| AI/LLM | OpenRouter API with `google/gemini-2.0-flash-001` — used in `/api/aimodel` and `/api/ai-feedback`; prompts live in `backend/constants/aiPrompts.js` |
| Voice | `@vapi-ai/web` — conducts the live interview; interview persona prompt in `frontend/constants/uiConstants.js` |
| UI components | Shadcn/ui (new-york style) + Radix UI primitives, in `frontend/components/ui/` |
| Animations | Framer Motion |
| Drag & Drop | `@dnd-kit` (question reordering in QuestionList) |
| Notifications | Sonner toasts |

### State Management

React Context only — no Redux or Zustand:
- `frontend/context/InterviewDataContext.jsx` — passes interview data through the interview flow
- `frontend/context/userDetailsContext.jsx` — current user info
- `frontend/context/theme.js` — purple-dark theme

### Testing

Jest + React Testing Library. Mocks for Clerk in `__mocks__/@clerk/`. Test files co-located with components (`.test.jsx` suffix).

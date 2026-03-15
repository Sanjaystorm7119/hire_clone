/**
 * Centralised AI model identifiers for OpenRouter.
 * Update here when a model is deprecated or you want to swap providers.
 *
 * Usage map:
 * ┌─────────────────────┬──────────────────────────────────────┬────────────────────────────────────────┐
 * │ Constant            │ Purpose                              │ File                                   │
 * ├─────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
 * │ GEMINI_FLASH_LITE   │ Generate interview questions         │ app/api/aimodel/route.jsx              │
 * │ GEMINI_FLASH_LITE   │ Score resume vs job description      │ app/api/resume-match/route.js          │
 * │ GEMINI_FLASH_LITE   │ Generate company intro for Vapi      │ app/api/company-summary/route.jsx      │ 
 * ├─────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
 * │ GEMINI_FLASH_25     │ Generate candidate feedback ratings  │ app/api/ai-feedback/route.jsx          │
 * ├─────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
 * │ GEMMA_3N            │ Extract fields from job description  │ app/api/parse-document/route.js        │
 * │ GEMMA_3N            │ Extract fields from candidate resume │ app/api/parse-resume/route.js          │
 * └─────────────────────┴──────────────────────────────────────┴────────────────────────────────────────┘
 */

// Fast, capable — interview question generation, resume matching
// export const GEMINI_FLASH = "google/gemini-2.0-flash-001"; -- soon deprecated by 01 june 26
export const GEMINI_FLASH_LITE = "google/gemini-2.5-flash-lite";


// More powerful flash variant for feedback
export const GEMINI_FLASH_25 = "google/gemini-2.5-flash";

// Lightweight free model — document and resume field extraction
export const GEMMA_3N = "google/gemma-3n-e2b-it:free";

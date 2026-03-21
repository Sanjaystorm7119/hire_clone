import { NextResponse } from "next/server";
import { GEMINI_FLASH_LITE } from "../../../backend/constants/aiModels";
import OpenAI from "openai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "../../../lib/supabase";

const MATCH_PROMPT = (resumeData, jdData) => `
You are a senior recruiter. Compare the candidate resume against the job description and return ONLY valid JSON with no markdown fences or extra text.

## Candidate Resume
Name: ${resumeData.candidate_name || "Unknown"}
Skills: ${JSON.stringify(resumeData.parsed_data?.skills || [])}
Experience: ${resumeData.parsed_data?.experience_summary || ""}
Education: ${resumeData.parsed_data?.education || ""}
Years of Experience: ${resumeData.parsed_data?.years_of_experience || ""}

## Job Description
Role: ${jdData.role_title || ""}
Requirements: ${jdData.raw_text || JSON.stringify(jdData.parsed_data || {})}

## Output Format
Return JSON exactly like this:
{
  "confidence_score": <0-100 overall match percentage>,
  "skills_score": <0-100 skills match percentage>,
  "experience_score": <0-100 experience match percentage>,
  "semantic_score": <0-100 semantic/contextual fit percentage>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "summary": "2-3 sentence explanation of the match"
}
`;

// POST /api/auto-match
// Body: { jd_id: number }
// Matches ALL resumes belonging to the user against the given JD.
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const user_email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!user_email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jd_id } = await req.json();
    if (!jd_id) {
      return NextResponse.json({ error: "jd_id is required" }, { status: 400 });
    }

    // Fetch JD
    const { data: jdData, error: jdError } = await supabase
      .from("job_descriptions")
      .select("*")
      .eq("id", jd_id)
      .eq("userEmail", user_email)
      .single();

    if (jdError || !jdData) {
      return NextResponse.json({ error: "Job description not found" }, { status: 404 });
    }

    // Fetch all resumes for this user
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("*")
      .eq("userEmail", user_email)
      .order("id", { ascending: false });

    if (resumesError) {
      return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json({ error: "No resumes found" }, { status: 404 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const results = [];
    const errors = [];

    for (const resume of resumes) {
      try {
        const completion = await openai.chat.completions.create({
          model: GEMINI_FLASH_LITE,
          messages: [
            {
              role: "user",
              content: MATCH_PROMPT(resume, jdData),
            },
          ],
        });

        const raw = completion.choices?.[0]?.message?.content || "";
        const cleaned = raw
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();

        let matchResult;
        try {
          matchResult = JSON.parse(cleaned);
        } catch {
          errors.push({ resume_id: resume.id, error: "Failed to parse model response" });
          continue;
        }

        const { data: savedMatch, error: saveError } = await supabase
          .from("candidate_job_matches")
          .insert({
            userEmail: user_email,
            resume_id: resume.id,
            jd_id,
            confidence_score: matchResult.confidence_score,
            skills_score: matchResult.skills_score,
            experience_score: matchResult.experience_score,
            semantic_score: matchResult.semantic_score,
            matched_skills: matchResult.matched_skills,
            missing_skills: matchResult.missing_skills,
          })
          .select()
          .single();

        if (saveError) {
          errors.push({ resume_id: resume.id, error: saveError.message });
          continue;
        }

        results.push(savedMatch);
      } catch (err) {
        errors.push({ resume_id: resume.id, error: err.message });
      }
    }

    return NextResponse.json(
      {
        matched: results.length,
        failed: errors.length,
        results,
        errors,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("auto-match error:", err);
    return NextResponse.json({ error: "Failed to process auto match" }, { status: 500 });
  }
}

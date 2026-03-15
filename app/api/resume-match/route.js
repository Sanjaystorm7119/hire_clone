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

    const { resume_id, jd_id } = await req.json();

    if (!resume_id || !jd_id) {
      return NextResponse.json(
        { error: "resume_id and jd_id are required" },
        { status: 400 }
      );
    }

    // Fetch resume and JD from Supabase
    const [resumeRes, jdRes] = await Promise.all([
      supabase
        .from("resumes")
        .select("*")
        .eq("id", resume_id)
        .eq("userEmail", user_email)
        .single(),
      supabase
        .from("job_descriptions")
        .select("*")
        .eq("id", jd_id)
        .eq("userEmail", user_email)
        .single(),
    ]);

    if (resumeRes.error || !resumeRes.data) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    if (jdRes.error || !jdRes.data) {
      return NextResponse.json(
        { error: "Job description not found" },
        { status: 404 }
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: GEMINI_FLASH_LITE,
      messages: [
        {
          role: "user",
          content: MATCH_PROMPT(resumeRes.data, jdRes.data),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let matchResult;
    try {
      matchResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse model response as JSON", raw },
        { status: 500 }
      );
    }

    // Save match to candidate_job_matches table
    const { data: savedMatch, error: saveError } = await supabase
      .from("candidate_job_matches")
      .insert({
        userEmail: user_email,
        resume_id,
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
      console.error("Error saving match:", saveError);
      return NextResponse.json({ error: "Failed to save match result" }, { status: 500 });
    }

    return NextResponse.json(
      {
        match: savedMatch,
        summary: matchResult.summary || "",
        resume: {
          id: resumeRes.data.id,
          candidate_name: resumeRes.data.candidate_name,
        },
        jd: {
          id: jdRes.data.id,
          role_title: jdRes.data.role_title,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("resume-match error:", err);
    return NextResponse.json({ error: "Failed to process resume match" }, { status: 500 });
  }
}

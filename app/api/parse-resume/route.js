import { GEMMA_3N } from "../../../backend/constants/aiModels";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const RESUME_EXTRACT_PROMPT = `Extract the following information from this resume and return ONLY valid JSON with no markdown fences or extra text:
{
  "candidate_name": "Full name of the candidate",
  "candidate_email": "Email address of the candidate (or empty string if not found)",
  "skills": ["skill1", "skill2"],
  "experience_summary": "Brief 2-3 sentence summary of work experience",
  "education": "Highest education level, degree, and field of study",
  "years_of_experience": "Estimated years of professional experience as a string (e.g. '3', '5-7')"
}
If a field cannot be determined from the document, use an empty string or empty array.`;

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 2 MB limit" },
        { status: 413 },
      );
    }

    const isPdf = mimeType === "application/pdf";
    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name?.toLowerCase().endsWith(".docx") ||
      file.name?.toLowerCase().endsWith(".doc");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 },
      );
    }

    let messageContent;

    if (isPdf) {
      const base64 = buffer.toString("base64");
      messageContent = [
        {
          type: "file",
          file: {
            filename: file.name || "resume.pdf",
            file_data: `data:application/pdf;base64,${base64}`,
          },
        },
        { type: "text", text: RESUME_EXTRACT_PROMPT },
      ];
    } else {
      const { value: docText } = await mammoth.extractRawText({ buffer });
      if (!docText?.trim()) {
        return NextResponse.json(
          { error: "Could not extract text from the document" },
          { status: 422 },
        );
      }
      messageContent = `Resume content:\n\n${docText}\n\n---\n\n${RESUME_EXTRACT_PROMPT}`;
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: GEMMA_3N,
      messages: [{ role: "user", content: messageContent }],
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse model response as JSON", raw },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        candidate_name: parsed.candidate_name || "",
        candidate_email: parsed.candidate_email || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience_summary: parsed.experience_summary || "",
        education: parsed.education || "",
        years_of_experience: parsed.years_of_experience || "",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("parse-resume error:", err);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 },
    );
  }
}

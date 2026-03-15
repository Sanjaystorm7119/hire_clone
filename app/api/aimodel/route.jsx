import { QUESTIONS_PROMPT } from "../../../backend/constants/aiPrompts";
import { GEMINI_FLASH_LITE } from "../../../backend/constants/aiModels";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobPosition, jobDescription, duration, type, companyDetails } =
      await req.json();

    // Validate required fields
    if (!jobPosition || !jobDescription || !duration || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize user inputs: strip null bytes and limit length to prevent prompt injection
    const sanitize = (str, max) =>
      String(str ?? "").replace(/\0/g, "").slice(0, max);

    const FINAL_PROMPT = QUESTIONS_PROMPT
      .replace("{{jobTitle}}", sanitize(jobPosition, 200))
      .replace("{{jobDescription}}", sanitize(jobDescription, 5000))
      .replace("{{duration}}", sanitize(duration, 20))
      .replace("{{type}}", sanitize(type, 100))
      .replace("{{companyDetails}}", sanitize(companyDetails, 2000));

    // console.log(FINAL_PROMPT);

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: GEMINI_FLASH_LITE,
      // model: "google/gemini-2.0-flash-exp:free",
      // model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      // model: "tngtech/deepseek-r1t2-chimera:free",
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    // console.log(completion.choices[0].message);

    if (!completion?.choices?.[0]?.message) {
      throw new Error("Invalid response structure from AI model");
    }
    // console.log(completion.choices[0].message);

    return NextResponse.json(completion.choices[0].message, { status: 200 });
  } catch (e) {
    console.error("aimodel error:", e);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}

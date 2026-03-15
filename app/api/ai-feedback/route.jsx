import { FEEDBACK } from "../../../backend/constants/aiPrompts";
import { GEMINI_FLASH_25 } from "../../../backend/constants/aiModels";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversation, interview_id, user_email, call_id, companyDetails } =
      await req.json();

    if (!conversation || !interview_id || !user_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Sanitize user inputs: strip null bytes and limit length to prevent prompt injection
    const sanitize = (str, max) =>
      String(str ?? "").replace(/\0/g, "").slice(0, max);

    // Prepend company details to the conversation prompt if available
    const companyPrefix = companyDetails
      ? `Company Details:\n${sanitize(companyDetails, 2000)}\n\n`
      : "";

    const FINAL_PROMPT =
      companyPrefix +
      FEEDBACK.replace("{{conversation}}", JSON.stringify(conversation).slice(0, 50000));

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: GEMINI_FLASH_25,
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    if (!completion?.choices?.[0]?.message) {
      throw new Error("Invalid response structure from AI model");
    }

    return NextResponse.json(
      {
        ...completion.choices[0].message,
        call_id: call_id,
        interview_id: interview_id,
        user_email: user_email,
        transcript: conversation,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("ai-feedback error:", e);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}

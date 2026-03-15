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

    const { jobPosition, jobDescription, companyDetails } = await req.json();

    // Validate required fields
    if (!jobPosition || !jobDescription || !companyDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Sanitize user inputs: strip null bytes and limit length to prevent prompt injection
    const sanitize = (str, max) =>
      String(str ?? "").replace(/\0/g, "").slice(0, max);

    const COMPANY_SUMMARY_PROMPT = `Based on the following job details, create a concise company summary that would be suitable for introducing the company to a candidate during an interview:

Job Position: ${sanitize(jobPosition, 200)}
Job Description: ${sanitize(jobDescription, 5000)}
Company Details: ${sanitize(companyDetails, 2000)}

Please create a professional, engaging summary that:

1. Highlights the company's key strengths and values  
2. Mentions the role and its importance  
3. Creates a positive first impression  
4. Is conversational and welcoming  
5. Keeps it concise — 3 paragraphs, each with a maximum of 3 sentences  
6. Write the summary in a naturally paced style for spoken delivery. Instead of using SSML tags like <break>, use a variety of sentence structures and punctuation to create natural pauses. For example:
  - Use short sentences to simulate brief pauses.  
  - Use commas and conjunctions to create natural rhythm.  
  - Use paragraph breaks to indicate longer pauses.  
  - End paragraphs with a sentence that gives a natural closing tone.  
7. Convert any symbols, percentages, or numbers into word format. For example, "$1.8 trillion" should be written as "one point eight trillion dollars", and "75%" as "seventy five percent".

Use a warm, conversational, and human tone. Avoid technical jargon. Do not include any markup or SSML tags.

Return only the summary text. Do not include any other formatting or explanations.`;

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: GEMINI_FLASH_LITE,
      messages: [{ role: "user", content: COMPANY_SUMMARY_PROMPT }],
    });

    if (!completion?.choices?.[0]?.message) {
      throw new Error("Invalid response structure from AI model");
    }

    const summary = completion.choices[0].message.content.trim();

    return NextResponse.json({ summary }, { status: 200 });
  } catch (e) {
    console.error("company-summary error:", e);
    return NextResponse.json({ error: "Failed to generate company summary" }, { status: 500 });
  }
}

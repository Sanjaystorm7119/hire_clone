import { GEMMA_3N } from "../../../backend/constants/aiModels";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const EXTRACT_PROMPT = `Extract the following information from this document and return ONLY valid JSON with no markdown fences or extra text:
{
  "company_name": "The company name only (short, e.g. 'Acme Corp')",
  "company_details": "Company background, mission, culture, and any other company information found in the document",
  "job_position": "The job title or position being advertised",
  "job_description": "All job requirements, responsibilities, and qualifications"
}
If a field cannot be determined from the document, use an empty string for that field.`;

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
    const isPdf = mimeType === "application/pdf";
    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name?.toLowerCase().endsWith(".docx") ||
      file.name?.toLowerCase().endsWith(".doc");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    // Build message content — PDF as base64 data URL, DOCX as extracted text
    let messageContent;

    if (isPdf) {
      const base64 = buffer.toString("base64");
      messageContent = [
        {
          type: "file",
          file: {
            filename: file.name || "document.pdf",
            file_data: `data:application/pdf;base64,${base64}`,
          },
        },
        { type: "text", text: EXTRACT_PROMPT },
      ];
    } else {
      const { value: docText } = await mammoth.extractRawText({ buffer });
      if (!docText?.trim()) {
        return NextResponse.json(
          { error: "Could not extract text from the document" },
          { status: 422 }
        );
      }
      messageContent = `Document content:\n\n${docText}\n\n---\n\n${EXTRACT_PROMPT}`;
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
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse model response as JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        company_name: parsed.company_name || "",
        company_details: parsed.company_details || "",
        job_position: parsed.job_position || "",
        job_description: parsed.job_description || "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("parse-document error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Lightbulb } from "lucide-react";

const AI_TIPS = [
  "Use Resume Matcher to score applicants before scheduling — cuts screening time by 40%.",
  "Upload job descriptions to the JD Bank once, reuse them across multiple interview sessions.",
  "Review candidate transcripts within 24 hours for the sharpest recall and comparison.",
  "Set a minimum rating filter in Candidate List to surface your top performers instantly.",
  "Candidates complete AI voice interviews on their own schedule — no coordinating needed.",
  "Export interview feedback to share structured evaluations with your hiring panel.",
  "Run Resume Matcher in bulk to get confidence scores across your entire applicant pool.",
];

function Welcome() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const tip = AI_TIPS[new Date().getDay() % AI_TIPS.length];

  return (
    <div
      className="flex items-start justify-between rounded-xl px-5 py-4 mb-5"
      style={{
        background: "#fff",
        border: "1px solid #EDE8DF",
        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
      }}
    >
      <div className="flex-1 min-w-0 pr-4">
        {/* Greeting */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className="text-[17px] font-bold leading-snug eva-heading"
            style={{ color: "#0F172A" }}
          >
            {greeting}, {user.firstName || "there"}
          </p>
          <span className="text-[13px]" style={{ color: "#94A3B8" }}>
            — your pipeline overview
          </span>
        </div>

        {/* AI tip */}
        <div
          className="flex items-start gap-2 mt-3 rounded-lg px-3 py-2"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
          <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 mt-px" style={{ color: "#F59E0B" }} />
          <p className="text-[12px] leading-relaxed" style={{ color: "#78350F" }}>
            <span className="font-semibold">Tip: </span>
            {tip}
          </p>
        </div>
      </div>

      {/* Avatar */}
      <Image
        src={user.imageUrl}
        width={44}
        height={44}
        alt="avatar"
        className="rounded-xl flex-shrink-0 mt-0.5"
        style={{ border: "1px solid #EDE8DF" }}
      />
    </div>
  );
}

export default Welcome;

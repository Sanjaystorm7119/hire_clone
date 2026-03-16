"use client";
import React from "react";
import moment from "moment";
import { useUser } from "@clerk/nextjs";
import { Send, Copy, Clock, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Deterministic avatar colors (no purple/violet) ────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#D1FAE5", text: "#065F46" }, // emerald
  { bg: "#DBEAFE", text: "#1E40AF" }, // blue
  { bg: "#FEE2E2", text: "#991B1B" }, // red
  { bg: "#E0F2FE", text: "#0369A1" }, // sky
  { bg: "#FFF7ED", text: "#9A3412" }, // orange
  { bg: "#ECFCCB", text: "#3F6212" }, // lime
  { bg: "#FCE7F3", text: "#831843" }, // pink
];

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name = "") {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function getStatus(interview) {
  const count = interview["interview_feedback"]?.length ?? 0;
  const ageDays = moment().diff(moment(interview.created_at), "days");

  if (count === 0) {
    return { label: "Live", bg: "#FEF3C7", color: "#92400E" };
  }
  if (ageDays < 14) {
    return { label: "Active", bg: "#D1FAE5", color: "#065F46" };
  }
  return { label: "Reviewing", bg: "#E0F2FE", color: "#0369A1" };
}

// ── Component ─────────────────────────────────────────────────────────────────

function InterviewCard({ interview, viewDetail = false }) {
  const url = process.env.NEXT_PUBLIC_HOST_URL + "/" + interview?.interviewId;
  const { user } = useUser();

  const avatarColor = getAvatarColor(interview?.companyName || "");
  const status = getStatus(interview);
  const candidateCount = interview["interview_feedback"]?.length ?? 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Unable to copy — please copy the link manually.");
    }
  };

  const onSend = () => {
    window.location.href = `mailto:${user?.emailAddresses[0]?.emailAddress}?subject=HireEva Interview Link&body=Interview Link: ${url}`;
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: "1px solid #EDE8DF",
        boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.11)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#EDE8DF";
      }}
    >
      {/* Amber top strip */}
      <div
        className="h-[3px]"
        style={{ background: "linear-gradient(90deg, #F59E0B 0%, rgba(245,158,11,0.25) 100%)" }}
      />

      <div className="p-4">
        {/* Header: avatar + status */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[13px] flex-shrink-0 eva-heading"
            style={{ background: avatarColor.bg, color: avatarColor.text }}
          >
            {getInitials(interview?.companyName || "?")}
          </div>
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full eva-heading"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Position title */}
        <h3
          className="text-[15px] font-bold leading-tight mb-1 truncate eva-heading"
          style={{ color: "#0F172A" }}
        >
          {interview?.jobPosition || "Untitled Position"}
        </h3>

        {/* Company name */}
        <p className="text-[12px] mb-3 truncate" style={{ color: "#64748B" }}>
          {interview?.companyName || "Unknown Company"}
        </p>

        {/* Meta: duration + candidates */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5" style={{ color: "#64748B" }}>
            <Clock className="h-3.5 w-3.5" style={{ color: "#CBD5E1" }} />
            <span className="text-[12px]">{interview?.duration} min</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ background: "#CBD5E1" }} />
          <div className="flex items-center gap-1.5" style={{ color: "#64748B" }}>
            <Users className="h-3.5 w-3.5" style={{ color: "#CBD5E1" }} />
            <span className="text-[12px]">
              {candidateCount} {candidateCount === 1 ? "candidate" : "candidates"}
            </span>
          </div>
        </div>

        {/* Date */}
        <p className="text-[11px] mb-4" style={{ color: "#94A3B8" }}>
          Created {moment(interview?.created_at).format("MMM D, YYYY")}
        </p>

        {/* Divider */}
        <div className="mb-3" style={{ borderTop: "1px solid #F1EDE5" }} />

        {/* Actions */}
        {!viewDetail ? (
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors duration-150"
              style={{
                border: "1px solid #EDE8DF",
                color: "#475569",
                background: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Link
            </button>
            <button
              onClick={onSend}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors duration-150"
              style={{ background: "#0F172A", color: "#F8FAFC" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0F172A")}
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </button>
          </div>
        ) : (
          <Link
            href={"/scheduled-interview/" + interview?.interviewId + "/details"}
            className="block"
          >
            <button
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-colors duration-150 eva-heading"
              style={{ background: "#F59E0B", color: "#0F172A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E08900")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F59E0B")}
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default InterviewCard;

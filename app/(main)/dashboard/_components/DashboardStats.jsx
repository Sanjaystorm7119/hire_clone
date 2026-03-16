"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "../../../../lib/supabase";
import { Video, CheckCircle2, Users, Star } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────

const STATS = [
  {
    key: "totalInterviews",
    label: "Interviews Created",
    icon: Video,
    suffix: "",
    accent: "#F59E0B",
    iconBg: "#FEF3C7",
  },
  {
    key: "completedInterviews",
    label: "Completed",
    icon: CheckCircle2,
    suffix: "",
    accent: "#10B981",
    iconBg: "#D1FAE5",
  },
  {
    key: "candidates",
    label: "Candidates Evaluated",
    icon: Users,
    suffix: "",
    accent: "#0F172A",
    iconBg: "#E2E8F0",
  },
  {
    key: "avgRating",
    label: "Avg. Score",
    icon: Star,
    suffix: " / 10",
    accent: "#F59E0B",
    iconBg: "#FEF3C7",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardStats() {
  const { user } = useUser();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    const email = user.emailAddresses[0]?.emailAddress;

    const [interviewsRes, feedbackRes] = await Promise.all([
      supabase
        .from("interviews")
        .select("*", { count: "exact", head: true })
        .eq("userEmail", email),
      supabase
        .from("interview-feedback")
        .select("feedback")
        .eq("userEmail", email),
    ]);

    const totalInterviews = interviewsRes.count ?? 0;
    const feedbackRows = feedbackRes.data ?? [];
    const completedInterviews = feedbackRows.length;
    const candidates = feedbackRows.length;

    const ratings = feedbackRows
      .map((r) => r.feedback?.rating?.OverallRating)
      .filter((n) => typeof n === "number" && n > 0);

    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "—";

    setData({ totalInterviews, completedInterviews, candidates, avgRating });
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {STATS.map(({ key, label, icon: Icon, suffix, accent, iconBg }) => (
        <div
          key={key}
          className="rounded-xl p-4"
          style={{
            background: "#fff",
            border: "1px solid #EDE8DF",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
          }}
        >
          {/* Label row */}
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-wide eva-heading"
              style={{ color: "#94A3B8", letterSpacing: "0.07em" }}
            >
              {label}
            </p>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
          </div>

          {/* Value */}
          <p
            className="text-[30px] font-bold leading-none eva-heading"
            style={{ color: data === null ? "#E8E4DC" : accent }}
          >
            {data === null ? (
              "—"
            ) : (
              <>
                {data[key]}
                {data[key] !== "—" && suffix && (
                  <span
                    className="text-[14px] font-normal ml-0.5"
                    style={{ color: "#CBD5E1" }}
                  >
                    {suffix}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

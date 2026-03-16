"use client";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import InterviewCard from "./InterviewCard";

function LatestInterviewsList() {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    user && getInterviewList();
  }, [user]);

  const getInterviewList = async () => {
    let { data: interviews } = await supabase
      .from("interviews")
      .select(`*,interview_feedback:interview-feedback(userEmail, transcript, call_id)`)
      .eq("userEmail", user.emailAddresses[0]?.emailAddress)
      .order("id", { ascending: false })
      .limit(6);
    setInterviewList(interviews || []);
    setLoading(false);
  };

  // Skeleton loader
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div
              className="h-5 w-40 rounded-lg animate-pulse mb-1"
              style={{ background: "#EDE8DF" }}
            />
            <div
              className="h-3 w-56 rounded animate-pulse"
              style={{ background: "#F1EDE5" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse"
              style={{ background: "#F5F1EB", height: 200, border: "1px solid #EDE8DF" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-[16px] font-bold leading-none eva-heading"
            style={{ color: "#0F172A" }}
          >
            Recent Interviews
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "#94A3B8" }}>
            Your latest 6 interview sessions
          </p>
        </div>
        {interviewList.length > 0 && (
          <Link
            href="/all-interview"
            className="text-[12px] font-semibold transition-colors eva-heading"
            style={{ color: "#F59E0B" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E08900")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#F59E0B")}
          >
            View all →
          </Link>
        )}
      </div>

      {/* Empty state */}
      {interviewList.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "#fff",
            border: "1.5px dashed #EDE8DF",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#FEF3C7" }}
          >
            <Plus className="h-6 w-6" style={{ color: "#F59E0B" }} />
          </div>
          <h3
            className="text-[15px] font-bold mb-1.5 eva-heading"
            style={{ color: "#0F172A" }}
          >
            No interviews yet
          </h3>
          <p
            className="text-[13px] mb-6 max-w-sm mx-auto leading-relaxed"
            style={{ color: "#94A3B8" }}
          >
            Create your first in under 2 minutes — just add a job description and
            Eva handles the rest.
          </p>
          <Link href="/dashboard/create-interview">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-colors eva-heading"
              style={{ background: "#F59E0B", color: "#0F172A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#E08900")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F59E0B")}
            >
              <Plus className="h-4 w-4" />
              Create your first interview
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewList.map((interview, index) => (
            <InterviewCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;

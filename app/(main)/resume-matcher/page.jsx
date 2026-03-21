"use client";
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Zap,
  CheckCircle2,
  XCircle,
  User,
  Briefcase,
  Star,
  Mail,
  MailCheck,
  SlidersHorizontal,
  Wand2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../frontend/components/ui/button";

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, score, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-2 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────
function MatchCard({ match, resumeMap, jdMap, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const resume = resumeMap[match.resume_id];
  const jd = jdMap[match.jd_id];
  const formattedDate = new Date(match.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const scoreColor =
    match.confidence_score >= 70
      ? "text-green-600 bg-green-50 border-green-200"
      : match.confidence_score >= 40
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-red-600 bg-red-50 border-red-200";

  const canEmail =
    resume?.candidate_email && match.confidence_score >= 60;

  const handleSendEmail = async () => {
    if (!resume?.candidate_email) return;
    setSendingEmail(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_email: resume.candidate_email,
          candidate_name: resume.candidate_name,
          role_title: jd?.role_title || "the position",
          company_name: jd?.parsed_data?.company_name || null,
          interview_id: jd?.interview_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send email");
        return;
      }
      setEmailSent(true);
      toast.success(`Email sent to ${resume.candidate_email}`);
    } catch (err) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
                <User className="w-4 h-4 text-blue-500" />
                {resume?.candidate_name || `Resume #${match.resume_id}`}
              </span>
              <span className="text-gray-300">→</span>
            </div>
            {resume?.candidate_email && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {resume.candidate_email}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
                <Briefcase className="w-4 h-4 text-purple-500" />
                {jd?.role_title || `JD #${match.jd_id}`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold border ${scoreColor}`}
            >
              {Math.round(match.confidence_score)}%
            </div>
            <button
              onClick={() => {
                setDeleting(true);
                onDelete(match.id).finally(() => setDeleting(false));
              }}
              disabled={deleting}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete match"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Email button */}
        {canEmail && (
          <div className="mt-3">
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || emailSent}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                emailSent
                  ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
              }`}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending…
                </>
              ) : emailSent ? (
                <>
                  <MailCheck className="w-3 h-3" />
                  Email sent
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3" />
                  Send outreach email
                </>
              )}
            </button>
          </div>
        )}

        {!resume?.candidate_email && match.confidence_score >= 60 && (
          <p className="mt-2 text-xs text-gray-400 italic">No email on file</p>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Hide details" : "View details"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="space-y-3">
                <ScoreBar
                  label="Skills Match"
                  score={Math.round(match.skills_score || 0)}
                  color="bg-blue-500"
                />
                <ScoreBar
                  label="Experience Match"
                  score={Math.round(match.experience_score || 0)}
                  color="bg-purple-500"
                />
                <ScoreBar
                  label="Semantic Fit"
                  score={Math.round(match.semantic_score || 0)}
                  color="bg-indigo-500"
                />
              </div>

              {match.matched_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Matched Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.matched_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.missing_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-500" />
                    Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.missing_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResumeMatcherPage() {
  const { user } = useUser();

  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [matches, setMatches] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState(null);

  // Manual match
  const [matching, setMatching] = useState(false);
  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJD, setSelectedJD] = useState("");

  // Auto-match
  const [autoMatchJD, setAutoMatchJD] = useState("");
  const [autoMatching, setAutoMatching] = useState(false);
  const [autoMatchProgress, setAutoMatchProgress] = useState(null);

  // Filter
  const [minScore, setMinScore] = useState(0);

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const fetchAll = useCallback(async () => {
    if (!userEmail) return;
    try {
      setLoadingData(true);
      setError(null);

      const [resumesRes, jdsRes] = await Promise.all([
        supabase
          .from("resumes")
          .select("id, candidate_name, candidate_email")
          .eq("userEmail", userEmail)
          .order("id", { ascending: false }),
        supabase
          .from("job_descriptions")
          .select("id, role_title, parsed_data, interview_id")
          .eq("userEmail", userEmail)
          .order("id", { ascending: false }),
      ]);

      if (resumesRes.error) throw resumesRes.error;
      if (jdsRes.error) throw jdsRes.error;

      setResumes(resumesRes.data || []);
      setJds(jdsRes.data || []);
      if (jdsRes.data?.length > 0) setAutoMatchJD(String(jdsRes.data[0].id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }, [userEmail]);

  const fetchMatches = useCallback(async () => {
    if (!userEmail) return;
    try {
      setLoadingMatches(true);
      const { data, error: err } = await supabase
        .from("candidate_job_matches")
        .select("*")
        .eq("userEmail", userEmail)
        .order("id", { ascending: false })
        .limit(100);

      if (err) throw err;
      setMatches(data || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchAll();
    fetchMatches();
  }, [fetchAll, fetchMatches]);

  // ── Manual match ──────────────────────────────────────────────────────────
  const handleRunMatch = useCallback(async () => {
    if (!selectedResume || !selectedJD) {
      toast.error("Please select both a resume and a job description");
      return;
    }
    setMatching(true);
    try {
      const res = await fetch("/api/resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: Number(selectedResume),
          jd_id: Number(selectedJD),
          user_email: userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Matching failed");
        return;
      }
      toast.success(
        `Match complete — ${Math.round(data.match.confidence_score)}% confidence`
      );
      setSelectedResume("");
      setSelectedJD("");
      fetchMatches();
    } catch (err) {
      toast.error(err.message || "Matching failed");
    } finally {
      setMatching(false);
    }
  }, [selectedResume, selectedJD, userEmail, fetchMatches]);

  // ── Auto-match ────────────────────────────────────────────────────────────
  const handleAutoMatch = useCallback(async () => {
    if (!autoMatchJD) {
      toast.error("Please select a job description to auto-match against");
      return;
    }
    setAutoMatching(true);
    setAutoMatchProgress(null);
    try {
      const res = await fetch("/api/auto-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_id: Number(autoMatchJD) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Auto-match failed");
        return;
      }
      setAutoMatchProgress({ matched: data.matched, failed: data.failed });
      toast.success(
        `Auto-match complete — ${data.matched} resume${data.matched !== 1 ? "s" : ""} matched${
          data.failed > 0 ? `, ${data.failed} failed` : ""
        }`
      );
      setAutoMatchJD("");
      fetchMatches();
    } catch (err) {
      toast.error(err.message || "Auto-match failed");
    } finally {
      setAutoMatching(false);
    }
  }, [autoMatchJD, fetchMatches]);

  // ── Delete match ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (matchId) => {
    const { error } = await supabase
      .from("candidate_job_matches")
      .delete()
      .eq("id", matchId)
      .eq("userEmail", userEmail);

    if (error) {
      toast.error("Failed to delete match");
      throw error;
    }
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }, [userEmail]);

  // ── Bulk email ────────────────────────────────────────────────────────────
  const [bulkEmailing, setBulkEmailing] = useState(false);

  const handleBulkEmail = useCallback(async () => {
    const qualified = filteredMatches.filter(
      (m) => m.confidence_score >= 60 && resumeMap[m.resume_id]?.candidate_email
    );
    if (qualified.length === 0) {
      toast.error("No qualified candidates with email addresses found");
      return;
    }

    setBulkEmailing(true);
    let sent = 0;
    let failed = 0;

    for (const match of qualified) {
      const resume = resumeMap[match.resume_id];
      const jd = jdMap[match.jd_id];
      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_email: resume.candidate_email,
            candidate_name: resume.candidate_name,
            role_title: jd?.role_title || "the position",
            company_name: jd?.parsed_data?.company_name || null,
            interview_id: jd?.interview_id || null,
          }),
        });
        if (res.ok) sent++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setBulkEmailing(false);
    toast.success(
      `Bulk email done — ${sent} sent${failed > 0 ? `, ${failed} failed` : ""}`
    );
  }, [matches, minScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build lookup maps
  const resumeMap = Object.fromEntries(resumes.map((r) => [r.id, r]));
  const jdMap = Object.fromEntries(jds.map((j) => [j.id, j]));

  // Deduplicate — keep the most recent match per resume+JD pair (matches are already sorted newest first)
  const deduped = matches.filter((m, _, arr) => {
    const key = `${m.resume_id}-${m.jd_id}`;
    return arr.findIndex((x) => `${x.resume_id}-${x.jd_id}` === key) === arr.indexOf(m);
  });

  // Filtered matches
  const filteredMatches = deduped.filter(
    (m) => Math.round(m.confidence_score) >= minScore
  );

  const qualifiedCount = filteredMatches.filter(
    (m) => m.confidence_score >= 60 && resumeMap[m.resume_id]?.candidate_email
  ).length;

  const noData = resumes.length === 0 || jds.length === 0;

  if (loadingData) {
    return (
      <div className="mt-4 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-2xl border border-red-200 gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button variant="outline" onClick={fetchAll}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-indigo-600" />
          Resume Matcher
        </h2>
      </div>

      {/* ── Manual match panel ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Run a New Match
        </h3>

        {noData ? (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            {resumes.length === 0 && jds.length === 0
              ? "Add resumes and job descriptions to your banks first."
              : resumes.length === 0
              ? "No resumes in your bank yet. Upload some on the Resume Bank page."
              : "No job descriptions in your bank yet. Upload some on the Job Details Bank page."}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select Resume
              </label>
              <div className="relative">
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                >
                  <option value="">— Choose candidate —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.candidate_name || `Resume #${r.id}`}
                      {r.candidate_email ? ` (${r.candidate_email})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Select Job Description
              </label>
              <div className="relative">
                <select
                  value={selectedJD}
                  onChange={(e) => setSelectedJD(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                >
                  <option value="">— Choose role —</option>
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.role_title || `JD #${j.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <Button
              onClick={handleRunMatch}
              disabled={matching || !selectedResume || !selectedJD}
              className="shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Matching…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Match
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* ── Auto-match panel ───────────────────────────────────────────────── */}
      {!noData && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-500" />
            Auto-Match All Resumes
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Select a job description and automatically match every resume in your bank against it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Job Description
              </label>
              <div className="relative">
                <select
                  value={autoMatchJD}
                  onChange={(e) => setAutoMatchJD(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                >
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.role_title || `JD #${j.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <Button
              onClick={handleAutoMatch}
              disabled={autoMatching || !autoMatchJD}
              className="shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              {autoMatching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Matching {resumes.length} resume{resumes.length !== 1 ? "s" : ""}…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Auto-Match {resumes.length} Resume{resumes.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>

          {autoMatchProgress && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Last run: {autoMatchProgress.matched} matched
              {autoMatchProgress.failed > 0 && `, ${autoMatchProgress.failed} failed`}
            </div>
          )}
        </div>
      )}

      {/* ── Match history ──────────────────────────────────────────────────── */}
      <div>
        {/* Header row with filter + bulk email */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Match History
            {matches.length > 0 && (
              <span className="text-xs text-gray-400 font-normal ml-1">
                ({filteredMatches.length}
                {filteredMatches.length !== deduped.length ? ` of ${deduped.length}` : ""})
              </span>
            )}
          </h3>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Score filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <label className="text-xs text-gray-500 whitespace-nowrap">Min score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) =>
                  setMinScore(Math.max(0, Math.min(100, Number(e.target.value))))
                }
                className="w-14 text-xs text-center border border-gray-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <span className="text-xs text-gray-400">%</span>
            </div>

            {/* Bulk email button */}
            {qualifiedCount > 0 && (
              <Button
                onClick={handleBulkEmail}
                disabled={bulkEmailing}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs"
              >
                {bulkEmailing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1.5" />
                    Email {qualifiedCount} Qualified{qualifiedCount !== 1 ? " Candidates" : " Candidate"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {loadingMatches ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading match history…
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
            <GitCompare className="w-14 h-14 text-indigo-300 mb-3" />
            {matches.length > 0 ? (
              <>
                <h4 className="text-base font-semibold text-gray-700">No matches above {minScore}%</h4>
                <p className="text-sm text-gray-500 mt-1">Lower the minimum score filter to see more results.</p>
              </>
            ) : (
              <>
                <h4 className="text-base font-semibold text-gray-700">No matches yet</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Run a match or use Auto-Match above to see results here.
                </p>
              </>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * Math.min(index, 10) }}
              >
                <MatchCard match={match} resumeMap={resumeMap} jdMap={jdMap} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

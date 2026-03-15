"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileUp,
  Loader2,
  Trash2,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../frontend/components/ui/button";

const PAGE_SIZE = 6;

function ResumeCard({ resume, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const skills = resume.parsed_data?.skills || [];
  const formattedDate = new Date(resume.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {resume.candidate_name || "Unknown Candidate"}
              </h3>
              <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                <Mail className="w-3 h-3 shrink-0" />
                {resume.candidate_email || "No email"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDelete(resume.id)}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          {resume.parsed_data?.years_of_experience && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {resume.parsed_data.years_of_experience} yrs exp
            </span>
          )}
          {resume.parsed_data?.education && (
            <span className="flex items-center gap-1 truncate">
              <GraduationCap className="w-3 h-3 shrink-0" />
              <span className="truncate">{resume.parsed_data.education}</span>
            </span>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(expanded ? skills : skills.slice(0, 4)).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
              >
                {skill}
              </span>
            ))}
            {!expanded && skills.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {resume.parsed_data?.experience_summary && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> More details
                </>
              )}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs text-gray-600 leading-relaxed"
                >
                  {resume.parsed_data.experience_summary}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        <p className="mt-3 text-xs text-gray-300">{formattedDate}</p>
      </div>
    </motion.div>
  );
}

function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useUser();

  const handleFileChange = useCallback(
    async (e) => {
      const selected = e.target.files?.[0];
      if (!selected) return;

      const isPdf = selected.type === "application/pdf";
      const isDocx =
        selected.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selected.name.toLowerCase().endsWith(".docx") ||
        selected.name.toLowerCase().endsWith(".doc");

      if (!isPdf && !isDocx) {
        toast.error("Please upload a PDF or Word (.docx) file");
        return;
      }

      setFile(selected);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", selected);

        const res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to parse resume");
          return;
        }

        const userEmail = user.emailAddresses[0]?.emailAddress;
        const { error } = await supabase.from("resumes").insert({
          userEmail,
          candidate_name: data.candidate_name,
          candidate_email: data.candidate_email,
          parsed_data: {
            skills: data.skills,
            experience_summary: data.experience_summary,
            education: data.education,
            years_of_experience: data.years_of_experience,
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Resume uploaded successfully");
        onUploaded();
      } catch (err) {
        console.error(err);
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [user, onUploaded]
  );

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />
      {file ? (
        <div className="flex items-center gap-2 px-4 py-3 border border-blue-200 bg-blue-50 rounded-xl text-sm">
          {uploading ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          ) : (
            <FileUp className="h-4 w-4 text-blue-600 shrink-0" />
          )}
          <span className="truncate text-blue-800 flex-1">{file.name}</span>
          <span className="text-blue-600 text-xs shrink-0">
            {uploading ? "Parsing & saving…" : "Done"}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Resume (PDF or DOCX)
        </button>
      )}
    </div>
  );
}

export default function ResumeBankPage() {
  const { user } = useUser();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchResumes = useCallback(
    async (page = 1) => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error: err, count } = await supabase
          .from("resumes")
          .select("*", { count: "exact" })
          .eq("userEmail", user.emailAddresses[0]?.emailAddress)
          .order("id", { ascending: false })
          .range(from, to);

        if (err) throw err;
        setResumes(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchResumes(currentPage);
  }, [fetchResumes, currentPage]);

  const handleDelete = useCallback(
    async (id) => {
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id)
        .eq("userEmail", userEmail);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Resume deleted");
      fetchResumes(currentPage);
    },
    [fetchResumes, currentPage]
  );

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading resumes…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-2xl border border-red-200 gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button variant="outline" onClick={() => fetchResumes(currentPage)}>
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
        <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Resume Bank
        </h2>
        <span className="text-sm text-gray-400">{totalCount} resume{totalCount !== 1 ? "s" : ""}</span>
      </div>

      <UploadPanel onUploaded={() => fetchResumes(1)} />

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-200 text-center p-8">
          <FileText className="w-16 h-16 text-blue-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No resumes yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Upload candidate resumes to build your bank.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <ResumeCard resume={resume} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

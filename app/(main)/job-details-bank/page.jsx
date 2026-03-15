"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../frontend/components/ui/button";

const PAGE_SIZE = 6;

// ── JD Card ──────────────────────────────────────────────────────────────────

function JDCard({ jd, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(jd.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const previewText = jd.raw_text?.slice(0, 200) || "";
  const interviewTypes = jd.parsed_data?.interview_types;

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {jd.role_title || "Untitled Role"}
              </h3>
              {jd.parsed_data?.company_name && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {jd.parsed_data.company_name}
                </p>
              )}
              {jd.interview_id && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <LinkIcon className="w-3 h-3" />
                  Linked to interview
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(jd.id)}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Interview type pills (only for records created from create-interview) */}
        {Array.isArray(interviewTypes) && interviewTypes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {interviewTypes.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100"
              >
                {t}
              </span>
            ))}
            {jd.parsed_data?.duration && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                {jd.parsed_data.duration} min
              </span>
            )}
          </div>
        )}

        {previewText && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              {expanded ? jd.raw_text : previewText + (jd.raw_text?.length > 200 ? "…" : "")}
            </p>
            {jd.raw_text?.length > 200 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 mt-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {jd.parsed_data && Object.keys(jd.parsed_data).length > 0 && (
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-1"
              >
                {jd.parsed_data.company_details && (
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Company details:</span>{" "}
                    {jd.parsed_data.company_details}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <p className="mt-3 text-xs text-gray-300">{formattedDate}</p>
      </div>
    </motion.div>
  );
}

// ── Upload Panel ──────────────────────────────────────────────────────────────

function UploadPanel({ onUploaded }) {
  const [progress, setProgress] = useState(null); // { current, total, name }
  const fileInputRef = useRef(null);
  const { user } = useUser();

  const handleFileChange = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const valid = files.filter((f) => {
        const isPdf = f.type === "application/pdf";
        const isDocx =
          f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          f.name.toLowerCase().endsWith(".docx") ||
          f.name.toLowerCase().endsWith(".doc");
        return isPdf || isDocx;
      });

      if (valid.length < files.length) {
        toast.error(`${files.length - valid.length} file(s) skipped — only PDF or DOCX allowed`);
      }
      if (!valid.length) return;

      const userEmail = user.emailAddresses[0]?.emailAddress;

      let succeeded = 0;
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        setProgress({ current: i + 1, total: valid.length, name: file.name });
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/parse-document", { method: "POST", body: formData });
          const data = await res.json();

          if (!res.ok) {
            toast.error(`${file.name}: ${data.error || "Failed to parse"}`);
            continue;
          }

          const { error } = await supabase.from("job_descriptions").insert({
            userEmail,
            role_title: data.job_position || "Untitled Role",
            raw_text: data.job_description,
            parsed_data: {
              company_name: data.company_name,
              company_details: data.company_details,
              job_position: data.job_position,
              job_description: data.job_description,
            },
          });

          if (error) {
            toast.error(`${file.name}: ${error.message}`);
          } else {
            succeeded++;
          }
        } catch (err) {
          console.error(err);
          toast.error(`${file.name}: Upload failed`);
        }
      }

      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (succeeded > 0) {
        toast.success(`${succeeded} job description${succeeded !== 1 ? "s" : ""} saved`);
        onUploaded();
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
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {progress ? (
        <div className="flex items-center gap-2 px-4 py-3 border border-purple-200 bg-purple-50 rounded-xl text-sm">
          <Loader2 className="h-4 w-4 text-purple-600 animate-spin shrink-0" />
          <span className="truncate text-purple-800 flex-1">{progress.name}</span>
          <span className="text-purple-600 text-xs shrink-0">
            {progress.current} / {progress.total}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Job Descriptions (PDF or DOCX — select multiple)
        </button>
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

const INTERVIEW_TYPE_OPTIONS = [
  "Technical",
  "Behavioral",
  "Experience",
  "Problem Solving",
  "Leadership",
];

function FilterBar({ filters, onChange, onClear, totalAll, totalFiltered }) {
  const hasActive =
    filters.company.trim() || filters.role.trim() || filters.experience.trim() || filters.types.length > 0;

  const toggleType = (t) => {
    onChange("types", filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t]);
  };

  return (
    <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Filter</span>
        <div className="flex items-center gap-3">
          {hasActive && (
            <span className="text-xs text-gray-400">
              {totalFiltered} of {totalAll} shown
            </span>
          )}
          {hasActive && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Text filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { key: "company", placeholder: "Company name…" },
          { key: "role", placeholder: "Role title…" },
          { key: "experience", placeholder: "Experience keyword…" },
        ].map(({ key, placeholder }) => (
          <div key={key} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={filters[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            {filters[key] && (
              <button
                onClick={() => onChange(key, "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Interview type pills */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Interview type</p>
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_TYPE_OPTIONS.map((t) => {
            const active = filters.types.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  active
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EMPTY_FILTERS = { company: "", role: "", experience: "", types: [] };

export default function JobDetailsBankPage() {
  const { user } = useUser();
  const [allJds, setAllJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const fetchJDs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("userEmail", user.emailAddresses[0]?.emailAddress)
        .order("id", { ascending: false });

      if (err) throw err;
      setAllJds(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJDs();
  }, [fetchJDs]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleDelete = useCallback(
    async (id) => {
      const userEmail = user?.emailAddresses[0]?.emailAddress;
      const { error } = await supabase
        .from("job_descriptions")
        .delete()
        .eq("id", id)
        .eq("userEmail", userEmail);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Job description deleted");
      setAllJds((prev) => prev.filter((j) => j.id !== id));
    },
    [user]
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  // Apply all filters (AND logic — each active filter must match)
  const filteredJds = useMemo(() => {
    return allJds.filter((jd) => {
      const company = filters.company.trim().toLowerCase();
      const role = filters.role.trim().toLowerCase();
      const experience = filters.experience.trim().toLowerCase();
      const types = filters.types;

      if (company) {
        const companyName = (jd.parsed_data?.company_name || "").toLowerCase();
        if (!companyName.includes(company)) return false;
      }

      if (role) {
        const roleTitle = (jd.role_title || "").toLowerCase();
        if (!roleTitle.includes(role)) return false;
      }

      if (experience) {
        const searchable = [
          jd.role_title || "",
          jd.raw_text || "",
          jd.parsed_data?.job_description || "",
        ].join(" ").toLowerCase();
        if (!searchable.includes(experience)) return false;
      }

      if (types.length > 0) {
        const jdTypes = jd.parsed_data?.interview_types || [];
        if (!types.some((t) => jdTypes.includes(t))) return false;
      }

      return true;
    });
  }, [allJds, filters]);

  const totalPages = Math.ceil(filteredJds.length / PAGE_SIZE);
  const pagedJds = filteredJds.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilter =
    filters.company.trim() || filters.role.trim() || filters.experience.trim() || filters.types.length > 0;

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading job descriptions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-2xl border border-red-200 gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-700 font-medium">{error}</p>
        <Button variant="outline" onClick={fetchJDs}>
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
        <h2 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-purple-600" />
          Job Details Bank
        </h2>
        <span className="text-sm text-gray-400">
          {allJds.length} job description{allJds.length !== 1 ? "s" : ""}
        </span>
      </div>

      <UploadPanel onUploaded={fetchJDs} />

      {allJds.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          totalAll={allJds.length}
          totalFiltered={filteredJds.length}
        />
      )}

      {allJds.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl border-2 border-dashed border-purple-200 text-center p-8">
          <Briefcase className="w-16 h-16 text-purple-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No job descriptions yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Upload job descriptions or create an interview to build your bank.
          </p>
        </div>
      ) : filteredJds.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center p-8">
          <Search className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-600">No matches found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting or clearing your filters.</p>
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-purple-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {pagedJds.map((jd, index) => (
              <motion.div
                key={jd.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <JDCard jd={jd} onDelete={handleDelete} />
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
                      ? "bg-purple-600 text-white"
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

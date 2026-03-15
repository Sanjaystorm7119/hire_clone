"use client";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  Trash2,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../frontend/components/ui/button";

const PAGE_SIZE = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse years_of_experience string to a number (lower bound). Returns NaN if unparseable. */
function parseYears(raw) {
  if (!raw) return NaN;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? NaN : n;
}

// ── Resume Card ───────────────────────────────────────────────────────────────

function ResumeCard({ resume, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const d = resume.parsed_data || {};
  const skills = d.skills || [];
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {resume.candidate_name || "Unknown Candidate"}
              </h3>
              {d.current_role && (
                <p className="text-xs text-blue-600 font-medium truncate">{d.current_role}</p>
              )}
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

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {d.years_of_experience && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {d.years_of_experience} yrs
            </span>
          )}
          {d.location && (
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{d.location}</span>
            </span>
          )}
          {d.degree && (
            <span className="flex items-center gap-1 truncate">
              <GraduationCap className="w-3 h-3 shrink-0" />
              <span className="truncate">{d.degree}{d.college ? ` · ${d.college}` : ""}</span>
            </span>
          )}
          {!d.degree && d.education && (
            <span className="flex items-center gap-1 truncate">
              <GraduationCap className="w-3 h-3 shrink-0" />
              <span className="truncate">{d.education}</span>
            </span>
          )}
        </div>

        {/* Skills */}
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

        {/* Expand / collapse experience summary */}
        {d.experience_summary && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> More details</>
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
                  {d.experience_summary}
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

// ── Upload Panel ──────────────────────────────────────────────────────────────

function UploadPanel({ onUploaded }) {
  const [progress, setProgress] = useState(null);
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
      await fetch("/api/users", { method: "POST" });

      let succeeded = 0;
      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        setProgress({ current: i + 1, total: valid.length, name: file.name });
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
          const data = await res.json();

          if (!res.ok) {
            toast.error(`${file.name}: ${data.error || "Failed to parse"}`);
            continue;
          }

          const { error } = await supabase.from("resumes").insert({
            userEmail,
            candidate_name: data.candidate_name,
            candidate_email: data.candidate_email,
            parsed_data: {
              skills: data.skills,
              experience_summary: data.experience_summary,
              education: data.education,
              years_of_experience: data.years_of_experience,
              current_role: data.current_role,
              location: data.location,
              degree: data.degree,
              college: data.college,
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
        toast.success(`${succeeded} resume${succeeded !== 1 ? "s" : ""} uploaded successfully`);
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
        <div className="flex items-center gap-2 px-4 py-3 border border-blue-200 bg-blue-50 rounded-xl text-sm">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          <span className="truncate text-blue-800 flex-1">{progress.name}</span>
          <span className="text-blue-600 text-xs shrink-0">
            {progress.current} / {progress.total}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload Resumes (PDF or DOCX — select multiple)
        </button>
      )}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

const DEGREE_OPTIONS = ["Bachelor's", "Master's", "PhD", "Associate's", "High School"];

const EMPTY_FILTERS = {
  role: "",
  techStack: "",
  location: "",
  degree: "",
  college: "",
  minYears: "",
  maxYears: "",
};

function FilterBar({ filters, onChange, onClear, totalAll, totalFiltered }) {
  const [open, setOpen] = useState(true);

  const hasActive = Object.entries(filters).some(([, v]) => v !== "");

  const field = (key, placeholder, icon) => (
    <div className="relative">
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
      <input
        value={filters[key]}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
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
  );

  return (
    <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActive && (
            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {totalFiltered} / {totalAll}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActive && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-white">
              {/* Row 1: Role, Tech Stack, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {field("role", "Role / job title…", <Briefcase className="w-3.5 h-3.5" />)}
                {field("techStack", "Tech stack / skill…", <Search className="w-3.5 h-3.5" />)}
                {field("location", "Location…", <MapPin className="w-3.5 h-3.5" />)}
              </div>

              {/* Row 2: Degree, College, Experience range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Degree dropdown */}
                <div className="relative">
                  <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={filters.degree}
                    onChange={(e) => onChange("degree", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none text-gray-700"
                  >
                    <option value="">Any degree</option>
                    {DEGREE_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {filters.degree && (
                    <button
                      onClick={() => onChange("degree", "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {field("college", "College / university…", <GraduationCap className="w-3.5 h-3.5" />)}

                {/* Experience year range */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={filters.minYears}
                      onChange={(e) => onChange("minYears", e.target.value)}
                      placeholder="Min yrs"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">to</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={filters.maxYears}
                      onChange={(e) => onChange("maxYears", e.target.value)}
                      placeholder="Max yrs (30+)"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                All active filters apply together (AND). Leave a filter blank to ignore it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumeBankPage() {
  const { user } = useUser();
  const [allResumes, setAllResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const fetchResumes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("resumes")
        .select("*")
        .eq("userEmail", user.emailAddresses[0]?.emailAddress)
        .order("id", { ascending: false });

      if (err) throw err;
      setAllResumes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
      setAllResumes((prev) => prev.filter((r) => r.id !== id));
    },
    [user]
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  // Apply all filters — AND logic
  const filteredResumes = useMemo(() => {
    return allResumes.filter((r) => {
      const d = r.parsed_data || {};

      // Role — search current_role + experience_summary
      if (filters.role.trim()) {
        const q = filters.role.trim().toLowerCase();
        const hay = [d.current_role || "", d.experience_summary || ""].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Tech stack — search skills array
      if (filters.techStack.trim()) {
        const q = filters.techStack.trim().toLowerCase();
        const skillsText = (d.skills || []).join(" ").toLowerCase();
        if (!skillsText.includes(q)) return false;
      }

      // Location
      if (filters.location.trim()) {
        const q = filters.location.trim().toLowerCase();
        if (!(d.location || "").toLowerCase().includes(q)) return false;
      }

      // Degree — exact match from dropdown
      if (filters.degree) {
        const deg = (d.degree || d.education || "").toLowerCase();
        if (!deg.includes(filters.degree.toLowerCase())) return false;
      }

      // College
      if (filters.college.trim()) {
        const q = filters.college.trim().toLowerCase();
        const hay = [d.college || "", d.education || ""].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Experience range
      const years = parseYears(d.years_of_experience);
      if (filters.minYears !== "") {
        const min = parseFloat(filters.minYears);
        if (!isNaN(min) && !isNaN(years) && years < min) return false;
      }
      if (filters.maxYears !== "") {
        const max = parseFloat(filters.maxYears);
        // 30+ treated as no upper bound when max is 30
        if (!isNaN(max) && max < 30 && !isNaN(years) && years > max) return false;
      }

      return true;
    });
  }, [allResumes, filters]);

  const totalPages = Math.ceil(filteredResumes.length / PAGE_SIZE);
  const pagedResumes = filteredResumes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const hasActiveFilter = Object.entries(filters).some(([, v]) => v !== "");

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
        <Button variant="outline" onClick={fetchResumes}>
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
        <span className="text-sm text-gray-400">
          {allResumes.length} resume{allResumes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <UploadPanel onUploaded={fetchResumes} />

      {allResumes.length > 0 && (
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          totalAll={allResumes.length}
          totalFiltered={filteredResumes.length}
        />
      )}

      {allResumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-200 text-center p-8">
          <FileText className="w-16 h-16 text-blue-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No resumes yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Upload candidate resumes to build your bank.
          </p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center p-8">
          <Search className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-600">No matches found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting or clearing your filters.</p>
          <button
            onClick={handleClearFilters}
            className="mt-3 text-sm text-blue-600 hover:underline"
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
            {pagedResumes.map((resume, index) => (
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

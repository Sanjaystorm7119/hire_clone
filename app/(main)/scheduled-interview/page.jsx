"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import InterviewCard from "../dashboard/_components/InterviewCard";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  Plus,
  Video,
  AlertCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 6;

function ScheduledInterview() {
  const { user } = useUser();


  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filterBy, setFilterBy] = useState("jobPosition");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Debounce search — no state on every keystroke, input is uncontrolled
  const handleSearchChange = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInputRef.current?.value ?? "");
      setCurrentPage(1);
    }, 350);
  }, []);

  const clearSearch = useCallback(() => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleFilterByChange = useCallback((e) => {
    setFilterBy(e.target.value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (user) {
      GetInterviewList(currentPage, searchQuery, filterBy);
    }
  }, [user, currentPage, searchQuery, filterBy]);

  const GetInterviewList = async (page, query, field) => {
    try {
      setLoading(true);
      setError(null);

      const userEmail = user.emailAddresses[0]?.emailAddress;
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let q = supabase
        .from("interviews")
        .select(
          "jobPosition,jobDescription,companyName,duration,interviewId,created_at",
          { count: "exact" }
        )
        .eq("userEmail", userEmail)
        .order("id", { ascending: false })
        .range(from, to);

      if (query?.trim()) {
        q = q.ilike(field, `%${query.trim()}%`);
      }

      const { data: interviews, error, count } = await q;

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message || "Failed to load interviews");
        return;
      }

      if (!interviews?.length) {
        setInterviewList([]);
        setTotalCount(count || 0);
        return;
      }

      // Fetch feedback counts separately to avoid requiring a DB foreign key
      const interviewIds = interviews.map((i) => i.interviewId);
      const { data: feedbackRows } = await supabase
        .from("interview-feedback")
        .select("interview_Id")
        .in("interview_Id", interviewIds);

      const countMap = {};
      (feedbackRows || []).forEach((row) => {
        countMap[row.interview_Id] = (countMap[row.interview_Id] || 0) + 1;
      });

      const merged = interviews.map((interview) => ({
        ...interview,
        interview_feedback: Array(countMap[interview.interviewId] || 0).fill({}),
      }));

      setInterviewList(merged);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200"
      >
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Loader className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ opacity: 0.3 }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg font-semibold text-gray-700"
          >
            Loading your interviews...
          </motion.p>
          <motion.div
            className="flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-4 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl border-2 border-dashed border-red-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-pink-400/5"></div>
        <div className="absolute top-4 right-4 w-20 h-20 bg-red-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-pink-200/30 rounded-full blur-xl"></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 text-center space-y-6"
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="text-white w-8 h-8" />
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ opacity: 0.3 }}
            />
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl font-bold text-red-700"
            >
              Oops! Something went wrong
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-red-600 max-w-md mx-auto"
            >
              {error}
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => GetInterviewList(currentPage, searchQuery, filterBy)}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
            >
              <motion.div
                className="bg-white/20 p-1 rounded-full"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span>Try Again</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-4"
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Interview List with Candidate Feedback
        </motion.h2>

        {/* Filter controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <select
            value={filterBy}
            onChange={handleFilterByChange}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <option value="jobPosition">Job Position</option>
            <option value="companyName">Company Name</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              onChange={handleSearchChange}
              placeholder={
                filterBy === "companyName"
                  ? "Search company…"
                  : "Search position…"
              }
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {totalCount === 0 && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border-2 border-dashed border-green-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-green-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-emerald-200/30 rounded-full blur-xl"></div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10 text-center space-y-6"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Video className="text-white w-10 h-10" />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.3 }}
              />
            </motion.div>

            <div className="space-y-2">
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl font-bold text-gray-800"
              >
                Start Building Your Interview Portfolio
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-gray-600 max-w-md mx-auto"
              >
                Create interviews and track your progress with detailed feedback
                from our AI system.
              </motion.p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href={"/dashboard/create-interview"}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
                >
                  <motion.div
                    className="bg-white/20 p-1 rounded-full"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.div>
                  <span>Create Your First Interview</span>
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Detailed Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Progress Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>AI Analysis</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {totalCount === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
          <Search className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">
            No interviews match &quot;{searchQuery}&quot; in{" "}
            {filterBy === "companyName" ? "company name" : "job position"}.
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {totalCount > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14"
          >
            {interviewList.map((interview, index) => (
              <motion.div
                key={interview.interviewId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <InterviewCard interview={interview} viewDetail={true} />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-3">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            {searchQuery ? "matching " : ""}interviews
          </p>
        </>
      )}
    </motion.div>
  );
}

export default ScheduledInterview;

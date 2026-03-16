"use client";
import { Input } from "../../../../../frontend/components/ui/input";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Textarea from "../../../../../frontend/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../frontend/components/ui/select";
import { InterviewTypes } from "../../../../../frontend/constants/uiConstants";
import { Button } from "../../../../../frontend/components/ui/button";
import { ArrowRight, FileUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_DURATION = "10";
const DEFAULT_TYPES = ["Technical", "Behavioral", "Experience"];

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState(DEFAULT_TYPES);
  const [companyName, setCompanyName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyDetails, setCompanyDetails] = useState("");
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  // File upload state
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Propagate defaults to parent on mount
  useEffect(() => {
    if (onHandleInputChange) {
      onHandleInputChange("duration", DEFAULT_DURATION);
      onHandleInputChange("type", DEFAULT_TYPES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable debounce function using useCallback
  const createDebounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Memoized debounced handlers
  const debouncedCompanyNameChange = useMemo(
    () =>
      createDebounce((value) => {
        if (onHandleInputChange) onHandleInputChange("companyName", value);
      }, 400),
    [onHandleInputChange, createDebounce]
  );

  const debouncedJobPositionChange = useMemo(
    () =>
      createDebounce((value) => {
        if (onHandleInputChange) onHandleInputChange("jobPosition", value);
      }, 600),
    [onHandleInputChange, createDebounce]
  );

  const debouncedJobDescriptionChange = useMemo(
    () =>
      createDebounce((value) => {
        if (onHandleInputChange) onHandleInputChange("jobDescription", value);
      }, 300),
    [onHandleInputChange, createDebounce]
  );

  const debouncedCompanyDetailsChange = useMemo(
    () =>
      createDebounce((value) => {
        if (onHandleInputChange) onHandleInputChange("companyDetails", value);
      }, 400),
    [onHandleInputChange, createDebounce]
  );

  // Sync interview type changes to parent
  useEffect(() => {
    if (interviewType.length > 0 && onHandleInputChange) {
      onHandleInputChange("type", interviewType);
    }
  }, [interviewType, onHandleInputChange]);

  // ── Input handlers ────────────────────────────────────────────────────────

  const handleCompanyNameChange = useCallback(
    (event) => {
      const value = event.target.value;
      setCompanyName(value);
      debouncedCompanyNameChange(value);
    },
    [debouncedCompanyNameChange]
  );

  const handleJobPositionChange = useCallback(
    (event) => {
      const value = event.target.value;
      setJobPosition(value);
      debouncedJobPositionChange(value);
    },
    [debouncedJobPositionChange]
  );

  const handleJobDescriptionChange = useCallback(
    (event) => {
      const value = event.target.value;
      setJobDescription(value);
      debouncedJobDescriptionChange(value);
    },
    [debouncedJobDescriptionChange]
  );

  const handleCompanyDetailsChange = useCallback(
    (event) => {
      const value = event.target.value;
      setCompanyDetails(value);
      debouncedCompanyDetailsChange(value);
    },
    [debouncedCompanyDetailsChange]
  );

  const handleDurationChange = useCallback(
    (value) => {
      setDuration(value);
      if (onHandleInputChange) onHandleInputChange("duration", value);
    },
    [onHandleInputChange]
  );

  const AddInterviewType = useCallback((type) => {
    setInterviewType((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  }, []);

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isPdf = file.type === "application/pdf";
      const isDocx =
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc");

      if (!isPdf && !isDocx) {
        toast.error("Please upload a PDF or Word (.docx) file");
        return;
      }

      setFileName(file.name);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to parse document");
          return;
        }

        // Populate fields with extracted data
        if (data.company_name) {
          setCompanyName(data.company_name);
          onHandleInputChange?.("companyName", data.company_name);
        }
        if (data.company_details) {
          setCompanyDetails(data.company_details);
          onHandleInputChange?.("companyDetails", data.company_details);
        }
        if (data.job_position) {
          setJobPosition(data.job_position);
          onHandleInputChange?.("jobPosition", data.job_position);
        }
        if (data.job_description) {
          setJobDescription(data.job_description);
          onHandleInputChange?.("jobDescription", data.job_description);
        }

        toast.success("Document parsed — fields have been filled in");
      } catch (err) {
        console.error("File parse error:", err);
        toast.error("Failed to parse document. Please try again.");
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-uploaded if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onHandleInputChange]
  );

  const clearFile = useCallback(() => {
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Interview type buttons ────────────────────────────────────────────────

  const interviewTypeButtons = useMemo(
    () =>
      InterviewTypes.map((type, index) => (
        <div
          key={index}
          className={`flex items-center cursor-pointer hover:bg-secondary gap-2 p-1 px-2 border border-gray-200 bg-white rounded-2xl ${
            interviewType.includes(type.title) && "bg-blue-50 text-primary"
          }`}
          onClick={() => AddInterviewType(type.title)}
        >
          <type.icons />
          <span>{type.title}</span>
        </div>
      )),
    [interviewType, AddInterviewType]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mx-2 space-y-3">

        {/* File upload section */}
        <div>
          <h2 className="text-sm font-medium mb-1">
            Auto-fill from Job Description
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileName ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm">
              {uploading ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
              ) : (
                <FileUp className="h-4 w-4 text-blue-600 shrink-0" />
              )}
              <span className="truncate text-blue-800 flex-1">{fileName}</span>
              {uploading ? (
                <span className="text-blue-600 text-xs shrink-0">Parsing…</span>
              ) : (
                <button onClick={clearFile} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FileUp className="h-4 w-4" />
              Upload PDF or Word document to auto-fill fields
            </button>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium">Company Name</h2>
          <Input
            placeholder="e.g. HireEva Inc."
            required
            className="mt-2"
            value={companyName}
            onChange={handleCompanyNameChange}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Company Details</h2>
          <Input
            placeholder="HireEva - Your interviewing Partner"
            required
            className="mt-2"
            value={companyDetails}
            onChange={handleCompanyDetailsChange}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Job Position</h2>
          <Input
            placeholder="Frontend Developer"
            required
            className="mt-2"
            value={jobPosition}
            onChange={handleJobPositionChange}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Job Description</h2>
          <Textarea
            placeholder="Enter job description"
            required
            className="mt-2"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium">Duration</h2>
          <Select value={duration} onValueChange={handleDurationChange}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Mins</SelectItem>
              <SelectItem value="10">10 Mins</SelectItem>
              <SelectItem value="15">15 Mins</SelectItem>
              <SelectItem value="30">30 Mins</SelectItem>
              <SelectItem value="45">45 Mins</SelectItem>
              <SelectItem value="60">60 Mins</SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-2">
            <h2 className="text-sm font-medium mb-2">Interview Types</h2>
            <div className="flex gap-3 flex-wrap">{interviewTypeButtons}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end" onClick={() => GoToNext()}>
        <Button className="mt-3">
          Next <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;

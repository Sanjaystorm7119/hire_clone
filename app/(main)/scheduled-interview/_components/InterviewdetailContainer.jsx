"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../frontend/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../frontend/components/ui/select";
import { Input } from "../../../../frontend/components/ui/input";
import Textarea from "../../../../frontend/components/ui/textarea";
import { Button } from "../../../../frontend/components/ui/button";
import { InterviewTypes } from "../../../../frontend/constants/uiConstants";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import moment from "moment";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTypes(raw) {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw || [];
  } catch {
    return [];
  }
}

function FormattedJobDescription({ description }) {
  if (!description) return null;
  const lines = description.split("\n").filter((l) => l.trim());
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const t = line.trim();
        const key = `line-${index}`;
        if (t.endsWith(":"))
          return (
            <h4 key={key} className="font-semibold text-foreground mt-3 mb-1">
              {t}
            </h4>
          );
        if (t.match(/^[\u2022\-\*]\s/))
          return (
            <div key={key} className="ml-4 flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span className="text-sm">{t.replace(/^[\u2022\-\*]\s/, "")}</span>
            </div>
          );
        return (
          <p key={key} className="text-sm leading-relaxed text-muted-foreground">
            {t}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function InterviewdetailContainer({ interviewDetail, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  // Company summary (read-only panel)
  const [companySummary, setCompanySummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [isCompanyDetailsOpen, setIsCompanyDetailsOpen] = useState(false);
  const [isCompanySummaryOpen, setIsCompanySummaryOpen] = useState(false);

  // ── Seed form from prop ──────────────────────────────────────────────────
  useEffect(() => {
    if (interviewDetail) {
      setForm({
        jobPosition: interviewDetail.jobPosition || "",
        jobDescription: interviewDetail.jobDescription || "",
        companyDetails: interviewDetail.companyDetails || "",
        duration: String(interviewDetail.duration || "30"),
        type: parseTypes(interviewDetail.type),
        questionList: (interviewDetail.questionList || []).map((q) => ({
          question: q.question || "",
          type: q.type || "",
        })),
      });
    }
  }, [interviewDetail]);

  // ── Company summary fetch ────────────────────────────────────────────────
  useEffect(() => {
    const fetchSummary = async () => {
      if (
        !interviewDetail?.jobPosition ||
        !interviewDetail?.jobDescription ||
        !interviewDetail?.companyDetails
      )
        return;
      setIsSummaryLoading(true);
      setSummaryError("");
      try {
        const res = await fetch("/api/company-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobPosition: interviewDetail.jobPosition,
            jobDescription: interviewDetail.jobDescription,
            companyDetails: interviewDetail.companyDetails,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed" }));
          throw new Error(err.error || "Failed to fetch summary");
        }
        const data = await res.json();
        setCompanySummary(data.summary || "");
      } catch (e) {
        setSummaryError(e.message || "Error generating summary");
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [
    interviewDetail?.jobPosition,
    interviewDetail?.jobDescription,
    interviewDetail?.companyDetails,
  ]);

  if (!interviewDetail || !form) return <div>Loading...</div>;

  // ── Form helpers ─────────────────────────────────────────────────────────

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleType = (title) =>
    setForm((f) => ({
      ...f,
      type: f.type.includes(title)
        ? f.type.filter((t) => t !== title)
        : [...f.type, title],
    }));

  const setQuestion = (index, value) =>
    setForm((f) => {
      const list = [...f.questionList];
      list[index] = { ...list[index], question: value };
      return { ...f, questionList: list };
    });

  const setQuestionType = (index, value) =>
    setForm((f) => {
      const list = [...f.questionList];
      list[index] = { ...list[index], type: value };
      return { ...f, questionList: list };
    });

  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      questionList: [...f.questionList, { question: "", type: "General" }],
    }));

  const removeQuestion = (index) =>
    setForm((f) => ({
      ...f,
      questionList: f.questionList.filter((_, i) => i !== index),
    }));

  const cancelEdit = () => {
    // Reset form to original data
    setForm({
      jobPosition: interviewDetail.jobPosition || "",
      jobDescription: interviewDetail.jobDescription || "",
      companyDetails: interviewDetail.companyDetails || "",
      duration: String(interviewDetail.duration || "30"),
      type: parseTypes(interviewDetail.type),
      questionList: (interviewDetail.questionList || []).map((q) => ({
        question: q.question || "",
        type: q.type || "",
      })),
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!form.jobPosition.trim()) {
      toast.error("Job position is required");
      return;
    }
    if (form.questionList.some((q) => !q.question.trim())) {
      toast.error("All questions must have text");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("interviews")
      .update({
        jobPosition: form.jobPosition.trim(),
        jobDescription: form.jobDescription.trim(),
        companyDetails: form.companyDetails.trim(),
        duration: form.duration,
        type: JSON.stringify(form.type),
        questionList: form.questionList,
      })
      .eq("interviewId", interviewDetail.interviewId);
    setSaving(false);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Interview updated successfully");
      setIsEditing(false);
      onUpdate?.();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Main details card ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={form.jobPosition}
                  onChange={(e) => setField("jobPosition", e.target.value)}
                  className="text-lg font-semibold"
                  placeholder="Job Position"
                />
              ) : (
                <CardTitle className="capitalize">
                  {interviewDetail.jobPosition}
                </CardTitle>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CardAction className="flex gap-1 items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created {moment(interviewDetail.created_at).format("MMM Do YY")}
              </CardAction>
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardDescription />
        </CardHeader>

        {/* Type + Duration row */}
        <div className="flex justify-between flex-wrap gap-4 px-6 pb-2">
          <CardContent className="p-0">
            <CardTitle className="mb-2">Type:</CardTitle>
            {isEditing ? (
              <div className="flex gap-2 flex-wrap">
                {InterviewTypes.map((t) => (
                  <div
                    key={t.title}
                    onClick={() => toggleType(t.title)}
                    className={`flex items-center cursor-pointer gap-1 px-3 py-1 border rounded-2xl text-sm select-none transition-colors ${
                      form.type.includes(t.title)
                        ? "bg-blue-50 border-blue-400 text-blue-700"
                        : "bg-white border-gray-200 hover:bg-secondary"
                    }`}
                  >
                    <t.icons className="h-4 w-4" />
                    {t.title}
                  </div>
                ))}
              </div>
            ) : (
              <CardDescription>
                <ul className="list-none space-y-1">
                  {parseTypes(interviewDetail.type).map((type, i) => (
                    <li key={`type-${i}`} className="flex items-center">
                      <span className="mr-2">-</span>
                      <span className="capitalize">{type}</span>
                    </li>
                  ))}
                </ul>
              </CardDescription>
            )}
          </CardContent>

          <CardContent className="p-0">
            <CardTitle className="mb-2">Duration:</CardTitle>
            {isEditing ? (
              <Select
                value={form.duration}
                onValueChange={(v) => setField("duration", v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {["5", "10", "15", "30", "45", "60"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d} Mins
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <CardDescription>{interviewDetail.duration} Mins</CardDescription>
            )}
          </CardContent>
        </div>

        {/* Job Description */}
        <CardContent>
          <CardTitle className="mb-2">Job Description:</CardTitle>
          {isEditing ? (
            <Textarea
              value={form.jobDescription}
              onChange={(e) => setField("jobDescription", e.target.value)}
              rows={5}
              placeholder="Enter job description"
            />
          ) : (
            <FormattedJobDescription
              description={interviewDetail.jobDescription}
            />
          )}
        </CardContent>

        {/* Questions */}
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>Interview Questions:</CardTitle>
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={addQuestion}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {form.questionList.map((item, index) => (
                <div
                  key={`q-edit-${index}`}
                  className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <span className="font-semibold text-blue-600 min-w-[32px] pt-2">
                    Q{index + 1}:
                  </span>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={item.question}
                      onChange={(e) => setQuestion(index, e.target.value)}
                      rows={2}
                      placeholder={`Question ${index + 1}`}
                    />
                    <Input
                      value={item.type}
                      onChange={(e) => setQuestionType(index, e.target.value)}
                      placeholder="Type (e.g. Technical, Behavioral)"
                      className="text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="mt-2 p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.questionList.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No questions yet. Click "Add Question" to add one.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interviewDetail.questionList?.map((item, index) => (
                <div
                  key={`q-${index}-${item?.question?.slice(0, 20)}`}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-fit">
                      Q{index + 1}:
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">{item?.question}</p>
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                        {item?.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Company details + summary card ────────────────────── */}
      <Card>
        <CardContent>
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() =>
              !isEditing && setIsCompanyDetailsOpen((prev) => !prev)
            }
          >
            <CardTitle>Company Details</CardTitle>
            {isEditing ? null : isCompanyDetailsOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {isEditing ? (
            <Textarea
              className="mt-3"
              value={form.companyDetails}
              onChange={(e) => setField("companyDetails", e.target.value)}
              rows={5}
              placeholder="Enter company details"
            />
          ) : (
            isCompanyDetailsOpen && (
              <CardDescription className="mt-2">
                <FormattedJobDescription
                  description={interviewDetail.companyDetails}
                />
              </CardDescription>
            )
          )}
        </CardContent>

        <CardContent>
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsCompanySummaryOpen((prev) => !prev)}
          >
            <CardTitle>Company Summary</CardTitle>
            {isCompanySummaryOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {isCompanySummaryOpen && (
            <CardDescription className="mt-2">
              {isSummaryLoading && <span>Generating summary…</span>}
              {!isSummaryLoading && summaryError && (
                <span className="text-red-600">{summaryError}</span>
              )}
              {!isSummaryLoading && !summaryError && companySummary && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {companySummary}
                </p>
              )}
            </CardDescription>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InterviewdetailContainer;

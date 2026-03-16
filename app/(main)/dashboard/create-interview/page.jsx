"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Progress from "../../../../frontend/components/ui/progress";
import React, { useState, useCallback, Suspense } from "react";
import FormContainer from "./_components/FormContainer";
import QuestionListComponent from "./_components/QuestionList";
import { toast } from "sonner";
import InterviewLink from "./_components/InterviewLink";
import { useUser } from "@clerk/nextjs";

function CreateInterviewInner() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [interview_Id, setInterview_Id] = useState();
  const { user } = useUser();

  // CRITICAL : Memoize function to prevent infinite re-renders
  const onHandleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
  }, []); // Empty dependency array as we are using functional update

  const onGoToNext = () => {
    if (user.credits <= 0) {
      toast("add credits , please contact admin");
      return;
    }
    if (
      !formData?.jobPosition ||
      !formData?.jobDescription ||
      !formData?.duration ||
      !formData.type
    ) {
      toast("Please enter all details");
      return;
    } else {
      setStep(step + 1);
    }
  };

  const onCreateInterviewLink = (interviewId) => {
    setInterview_Id(interviewId);
    setStep(step + 1);
  };

  return (
    <div className="mt-5 p-2.5 bg-white rounded-2xl py-2.5">
      <div className="flex gap-2 items-center">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <h2 className="font-bold text-2xl">Create new Interview</h2>
      </div>
      <Progress value={step * 33.33} className="my-5" />
      {step === 1 ? (
        <FormContainer
          onHandleInputChange={onHandleInputChange}
          GoToNext={() => onGoToNext()}
        />
      ) : step === 2 ? (
        <QuestionListComponent
          formData={formData}
          onCreateInterviewLink={(interviewId) =>
            onCreateInterviewLink(interviewId)
          }
        />
      ) : step === 3 ? (
        <InterviewLink interviewId={interview_Id} formData={formData} />
      ) : null}
    </div>
  );
}

// Reads the ?new= param and uses it as a key so CreateInterviewInner fully
// remounts (resetting all state) whenever "New Interview" or "Add interview"
// is clicked from an existing session.
function CreateInterviewWithKey() {
  const searchParams = useSearchParams();
  const sessionKey = searchParams.get("new") ?? "init";
  return <CreateInterviewInner key={sessionKey} />;
}

export default function CreateInterview() {
  return (
    <Suspense>
      <CreateInterviewWithKey />
    </Suspense>
  );
}

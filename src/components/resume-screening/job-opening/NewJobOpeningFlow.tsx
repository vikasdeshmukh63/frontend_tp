"use client";

import PageContentLayout from "@/components/common/PageContentLayout";
import { parseJobDescriptionPdf } from "@/features/job-opening/api/parse-jd";
import { jdExtractionToJobPostDraft } from "@/features/job-opening/utils/jd-extraction-to-draft";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import type { JobPostDraft } from "@/types/job-post-draft";
import React, { useCallback, useState } from "react";
import JobDescriptionUpload from "../JobDescriptionUpload";
import JdExtractionLoader from "./JdExtractionLoader";
import JobOpeningWizard from "./JobOpeningWizard";
import { getEmptyJobPostDraft, getMockExtractedJobPost } from "./mockJobPostData";

type Phase = "upload" | "loading" | "wizard";

export default function NewJobOpeningFlow() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [draft, setDraft] = useState<JobPostDraft>(() => getEmptyJobPostDraft());
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileAccepted = useCallback(async (file: File) => {
    setUploadError(null);
    setPhase("loading");
    const token = useAuthStore.getState().token;
    if (!token) {
      setUploadError("Please sign in to parse a job description.");
      setPhase("upload");
      return;
    }
    try {
      const data = await parseJobDescriptionPdf(file, token);
      setDraft(jdExtractionToJobPostDraft(data));
      setPhase("wizard");
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Could not parse this PDF. Try another file or start from scratch.";
      setUploadError(msg);
      setPhase("upload");
    }
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setDraft(getEmptyJobPostDraft());
    setUploadError(null);
    setPhase("wizard");
  }, []);

  const handleStartFromSample = useCallback(() => {
    setDraft(getMockExtractedJobPost());
    setUploadError(null);
    setPhase("wizard");
  }, []);

  if (phase === "wizard") {
    return (
      <div className="w-full">
        <h1 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
          New job opening
        </h1>
        <JobOpeningWizard draft={draft} onChange={setDraft} />
      </div>
    );
  }

  return (
    <PageContentLayout
      title="New job opening"
      subtitle={
        phase === "loading"
          ? "Processing your job description…"
          : "Upload a job description PDF to get started, or use one of the options below."
      }
      panelClassName="min-h-[min(520px,65vh)] border-0 bg-gradient-to-b from-[#f8f9fc] to-white shadow-none dark:bg-transparent dark:[background-image:none]"
    >
      {phase === "loading" ? (
        <JdExtractionLoader />
      ) : (
        <div className="flex w-full flex-col items-center">
          {uploadError ? (
            <div
              className="mb-4 w-full max-w-lg rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive dark:bg-destructive/20"
              role="alert"
            >
              {uploadError}
            </div>
          ) : null}
          <JobDescriptionUpload
            onFileAccepted={handleFileAccepted}
            onStartFromScratch={handleStartFromScratch}
            onStartFromSample={handleStartFromSample}
          />
        </div>
      )}
    </PageContentLayout>
  );
}

"use client";

import PageContentLayout from "@/components/common/PageContentLayout";
import type { JobPostDraft } from "@/types/job-post-draft";
import React, { useCallback, useState } from "react";
import JobDescriptionUpload from "../JobDescriptionUpload";
import JdExtractionLoader from "./JdExtractionLoader";
import JobOpeningWizard from "./JobOpeningWizard";
import { getMockExtractedJobPost } from "./mockJobPostData";

type Phase = "upload" | "loading" | "wizard";

/** Simulated extraction delay before showing the editor (replace with real API). */
const MOCK_EXTRACTION_MS = 2200;

export default function NewJobOpeningFlow() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [draft, setDraft] = useState<JobPostDraft>(() => getMockExtractedJobPost());

  const runExtraction = useCallback(() => {
    setPhase("loading");
    window.setTimeout(() => {
      setDraft(getMockExtractedJobPost());
      setPhase("wizard");
    }, MOCK_EXTRACTION_MS);
  }, []);

  const handleFileAccepted = useCallback(() => {
    runExtraction();
  }, [runExtraction]);

  const handleStartFromScratch = useCallback(() => {
    setDraft(getMockExtractedJobPost());
    setPhase("wizard");
  }, []);

  if (phase === "wizard") {
    return (
      <div className="w-full">
        <h1 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">New job opening</h1>
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
        <JobDescriptionUpload
          onFileAccepted={handleFileAccepted}
          onStartFromScratch={handleStartFromScratch}
          onStartFromSample={handleStartFromScratch}
        />
      )}
    </PageContentLayout>
  );
}

"use client";

import PageContentLayout from "@/components/common/PageContentLayout";
import { parseJobDescriptionPdf } from "@/features/job-opening/api/parse-jd";
import { jdExtractionToJobPostDraft } from "@/features/job-opening/utils/jd-extraction-to-draft";
import { ApiError } from "@/lib/api/client";
import {
  useJobOpeningDraftHydrated,
  useJobOpeningDraftStore,
} from "@/stores/job-opening-draft-store";
import { useAuthStore } from "@/stores/auth-store";
import React, { useCallback, useState } from "react";
import JobDescriptionUpload from "../JobDescriptionUpload";
import JdExtractionLoader from "./JdExtractionLoader";
import JobOpeningWizard from "./JobOpeningWizard";
import { getMockExtractedJobPost } from "./mockJobPostData";

export default function NewJobOpeningFlow() {
  const hydrated = useJobOpeningDraftHydrated();
  const flowPhase = useJobOpeningDraftStore((s) => s.flowPhase);
  const enterWizard = useJobOpeningDraftStore((s) => s.enterWizard);
  const startWizardEmpty = useJobOpeningDraftStore((s) => s.startWizardEmpty);

  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileAccepted = useCallback(
    async (file: File) => {
      setUploadError(null);
      setParsing(true);
      const token = useAuthStore.getState().token;
      if (!token) {
        setUploadError("Please sign in to parse a job description.");
        setParsing(false);
        return;
      }
      try {
        const data = await parseJobDescriptionPdf(file, token);
        enterWizard(jdExtractionToJobPostDraft(data));
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : "Could not parse this PDF. Try another file or start from scratch.";
        setUploadError(msg);
      } finally {
        setParsing(false);
      }
    },
    [enterWizard],
  );

  const handleStartFromScratch = useCallback(() => {
    startWizardEmpty();
    setUploadError(null);
  }, [startWizardEmpty]);

  const handleStartFromSample = useCallback(() => {
    enterWizard(getMockExtractedJobPost());
    setUploadError(null);
  }, [enterWizard]);

  if (!hydrated) {
    return (
      <PageContentLayout
        title="New job opening"
        subtitle="Loading…"
        panelClassName="min-h-[min(520px,65vh)] border-0 bg-gradient-to-b from-[#f8f9fc] to-white shadow-none dark:bg-transparent dark:[background-image:none]"
      >
        <JdExtractionLoader />
      </PageContentLayout>
    );
  }

  if (flowPhase === "wizard") {
    return (
      <div className="w-full space-y-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          New job opening
        </h1>
        <JobOpeningWizard />
      </div>
    );
  }

  return (
    <PageContentLayout
      title="New job opening"
      subtitle={
        parsing
          ? "Processing your job description…"
          : "Upload a job description PDF to get started, or use one of the options below."
      }
      panelClassName="min-h-[min(520px,65vh)] border-0 bg-gradient-to-b from-[#f8f9fc] to-white shadow-none dark:bg-transparent dark:[background-image:none]"
    >
      {parsing ? (
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

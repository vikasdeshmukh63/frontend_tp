"use client";

import { Button } from "@/components/ui/button";
import type { JobPostDraft } from "@/types/job-post-draft";
import Link from "next/link";
import React, { useState } from "react";
import {
  validateJobPostStep1,
  type JobPostStep1FieldErrors,
} from "./job-post-step1-validation";
import JobPostFormPanel from "./JobPostFormPanel";
import JobPostLivePreview from "./JobPostLivePreview";

const STEPS = [
  { id: 1, title: "Job post", description: "Details candidates see" },
  { id: 2, title: "Application form", description: "Fields candidates must fill out" },
  { id: 3, title: "Candidate pipeline", description: "Different stages and automations" },
] as const;

type JobOpeningWizardProps = {
  draft: JobPostDraft;
  onChange: (next: JobPostDraft) => void;
};

export default function JobOpeningWizard({ draft, onChange }: JobOpeningWizardProps) {
  const [step, setStep] = useState(1);
  /** Steps 2–3 stay locked until step 1 passes validation via Next. */
  const [step1Completed, setStep1Completed] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step1FieldErrors, setStep1FieldErrors] = useState<JobPostStep1FieldErrors>(
    {},
  );

  const handleDraftChange = (next: JobPostDraft) => {
    onChange(next);
    setStep1FieldErrors({});
    setStep1Error(null);
  };

  const goToStep = (id: number) => {
    if (id >= 2 && !step1Completed) return;
    setStep1Error(null);
    setStep1FieldErrors({});
    setStep(id);
  };

  const handleNext = () => {
    setStep1Error(null);
    if (step === 1) {
      const result = validateJobPostStep1(draft);
      if (!result.ok) {
        setStep1FieldErrors(result.fieldErrors);
        const vals = Object.values(result.fieldErrors);
        setStep1Error(
          vals.length > 1
            ? vals.join(" · ")
            : result.message ?? "Complete the required fields to continue.",
        );
        return;
      }
      setStep1FieldErrors({});
      setStep1Completed(true);
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-0">
      <header className="shrink-0 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <nav aria-label="Job opening steps" className="min-w-0 flex-1">
            <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6 lg:gap-10">
              {STEPS.map((s) => {
                const active = step === s.id;
                const done = step > s.id;
                const locked = s.id >= 2 && !step1Completed;
                return (
                  <li key={s.id} className="min-w-0 flex-1 sm:flex-initial sm:max-w-[220px]">
                    <button
                      type="button"
                      disabled={locked}
                      aria-disabled={locked}
                      title={
                        locked
                          ? "Complete and continue from step 1 to unlock this step"
                          : undefined
                      }
                      onClick={() => goToStep(s.id)}
                      className={`w-full text-left transition ${
                        locked
                          ? "cursor-not-allowed text-gray-400 opacity-60 dark:text-gray-600"
                          : active
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            active
                              ? "bg-brand-500 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-brand-400 dark:ring-offset-gray-900"
                              : done
                                ? "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
                                : locked
                                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {s.id}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                            {s.description}
                          </span>
                        </span>
                      </div>
                      {active ? (
                        <span className="mt-2 block h-0.5 w-full rounded-full bg-brand-500 dark:bg-brand-400" />
                      ) : (
                        <span className="mt-2 block h-0.5 w-full rounded-full bg-transparent" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="default" asChild>
              <Link href="/resume-screening/job-openings">Cancel</Link>
            </Button>
            <Button
              type="button"
              disabled={step >= 3}
              onClick={handleNext}
              className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {step >= 3 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pt-5">
        {step1Error && step === 1 ? (
          <div
            className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/20"
            role="alert"
          >
            {step1Error}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-2 lg:gap-8">
            <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1 dark:border-gray-800 dark:bg-white/[0.02]">
              <JobPostFormPanel
                draft={draft}
                onChange={handleDraftChange}
                fieldErrors={step1FieldErrors}
              />
            </div>
            <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1 dark:border-gray-800 dark:bg-white/[0.02]">
              <JobPostLivePreview draft={draft} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-20 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Application form</p>
              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                Configure fields candidates must fill out. API integration coming next.
              </p>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/30 px-6 py-20 text-center dark:border-gray-700 dark:bg-gray-900/20">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Candidate pipeline</p>
              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                Define stages and automations. API integration coming next.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

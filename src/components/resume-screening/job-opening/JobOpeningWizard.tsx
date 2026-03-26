"use client";

import { Button } from "@/components/ui/button";
import type { JobPostDraft } from "@/types/job-post-draft";
import Link from "next/link";
import React, { useState } from "react";
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

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-0">
      <header className="shrink-0 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <nav aria-label="Job opening steps" className="min-w-0 flex-1">
            <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6 lg:gap-10">
              {STEPS.map((s) => {
                const active = step === s.id;
                const done = step > s.id;
                return (
                  <li key={s.id} className="min-w-0 flex-1 sm:flex-initial sm:max-w-[220px]">
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`w-full text-left transition ${
                        active
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
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {step >= 3 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pt-5">
        {step === 1 ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-2 lg:gap-8">
            <div className="min-h-0 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-1 dark:border-gray-800 dark:bg-white/[0.02]">
              <JobPostFormPanel draft={draft} onChange={onChange} />
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

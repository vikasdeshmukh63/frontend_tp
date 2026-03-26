"use client";

import { Button } from "@/components/ui/button";
import { formatInrLpaRange } from "@/lib/format-salary-inr";
import { looksLikeHtml, sanitizeRichHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";
import type { JobPostDraft } from "@/types/job-post-draft";
import { Briefcase, Globe, MapPin, Share2 } from "lucide-react";
import React, { useMemo } from "react";

function PreviewRichBlock({ html, empty = "—" }: { html: string; empty?: string }) {
  if (!html.trim()) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  if (!looksLikeHtml(html)) {
    return (
      <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-gray-300">
        {html}
      </p>
    );
  }
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-gray-700 dark:text-gray-300",
        "[&_a]:text-brand-600 [&_a]:underline [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-1",
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}

type JobPostLivePreviewProps = {
  draft: JobPostDraft;
};

function linesFromBlock(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function JobPostLivePreview({ draft }: JobPostLivePreviewProps) {
  const responsibilityLines = useMemo(() => linesFromBlock(draft.responsibilities), [draft.responsibilities]);
  const mandatorySkills = useMemo(
    () => draft.skills.filter((s) => s.mandatory).map((s) => s.name),
    [draft.skills],
  );
  const lpa = useMemo(
    () => formatInrLpaRange(draft.salaryMin, draft.salaryMax),
    [draft.salaryMin, draft.salaryMax],
  );

  const expLabel = `${draft.experienceMin}-${draft.experienceMax} years experience`;

  return (
    <div className="space-y-6 pr-1">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          How your job post will appear to candidates
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{draft.jobTitle || "Job title"}</h2>

            <div className="flex flex-wrap gap-2">
              {draft.locations[0] ? (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                  {draft.locations[0]}
                </span>
              ) : null}
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                {expLabel}
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                {draft.employmentType}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">
                {lpa}
              </span>
            </div>

            {draft.keyCallout ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                {draft.keyCallout}
              </div>
            ) : null}

            <section>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">The Role</h4>
              <PreviewRichBlock html={draft.jobSummary} />
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">What you&apos;ll do</h4>
              {looksLikeHtml(draft.responsibilities) ? (
                <PreviewRichBlock html={draft.responsibilities} />
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  {responsibilityLines.length
                    ? responsibilityLines.map((line, i) => (
                        <li key={i}>{line.replace(/^•\s*/, "")}</li>
                      ))
                    : (
                      <li>—</li>
                    )}
                </ul>
              )}
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                What we&apos;re looking for
              </h4>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-700 dark:text-brand-400">
                Mandatory skills
              </p>
              <div className="flex flex-wrap gap-2">
                {mandatorySkills.length
                  ? mandatorySkills.map((name) => (
                      <span
                        key={name}
                        className="rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-900 dark:border-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                      >
                        {name}
                      </span>
                    ))
                  : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Perks & benefits</h4>
              {looksLikeHtml(draft.perks) ? (
                <PreviewRichBlock html={draft.perks} />
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {linesFromBlock(draft.perks).map((line, i) => (
                    <li key={i}>{line.replace(/^•\s*/, "")}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="w-full shrink-0 space-y-3 lg:w-[220px]">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Apply
              </Button>
              <Button type="button" variant="outline" size="default" className="gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Briefcase className="h-3.5 w-3.5" />
                Seniority
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{draft.seniority}</p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Globe className="h-3.5 w-3.5" />
                Work arrangement
              </div>
              <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {draft.workArrangement.replace("-", " ")}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                Office location
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {draft.locations[0] ?? "—"}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

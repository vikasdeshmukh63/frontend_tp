"use client";

import { Button } from "@/components/ui/button";
import { formatInrLpaRange } from "@/lib/format-salary-inr";
import { looksLikeHtml, sanitizeRichHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";
import type { JobPostDraft } from "@/types/job-post-draft";
import { Briefcase, Globe, MapPin, Share2, Star } from "lucide-react";
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
        "tiptap text-sm leading-relaxed text-gray-700 dark:text-gray-300",
        "[&_a]:text-brand-600 [&_a]:underline [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2",
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
    />
  );
}

type JobPostLivePreviewProps = {
  draft: JobPostDraft;
  /** Full-page / public view — hides the “Live Preview” chrome. */
  standalone?: boolean;
  /** When set, Share copies `{origin}/jobs/{id}` (public application link). */
  shareJobOpeningId?: number;
};

function linesFromBlock(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function JobPostLivePreview({
  draft,
  standalone = false,
  shareJobOpeningId,
}: JobPostLivePreviewProps) {
  const responsibilityLines = useMemo(() => linesFromBlock(draft.responsibilities), [draft.responsibilities]);
  const mandatorySkills = useMemo(
    () => draft.skills.filter((s) => s.mandatory).map((s) => s.name),
    [draft.skills],
  );
  const preferredSkills = useMemo(
    () => draft.skills.filter((s) => !s.mandatory).map((s) => s.name),
    [draft.skills],
  );
  const [shareHint, setShareHint] = React.useState<string | null>(null);
  const [shareBaseUrl, setShareBaseUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    setShareBaseUrl(window.location.origin);
  }, []);

  React.useEffect(() => {
    if (!shareHint) return;
    const t = window.setTimeout(() => setShareHint(null), 3500);
    return () => window.clearTimeout(t);
  }, [shareHint]);

  const shareUrl =
    shareBaseUrl &&
    typeof shareJobOpeningId === "number" &&
    Number.isFinite(shareJobOpeningId) &&
    shareJobOpeningId > 0
      ? `${shareBaseUrl}/jobs/${shareJobOpeningId}`
      : null;

  const handleShare = () => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setShareHint("Link copied! Candidates can use this URL to view and apply.");
    });
  };
  const lpa = useMemo(
    () =>
      draft.salaryMin && draft.salaryMax
        ? formatInrLpaRange(draft.salaryMin, draft.salaryMax)
        : "",
    [draft.salaryMin, draft.salaryMax],
  );

  const expLabel = draft.experienceMin && draft.experienceMax ? `${draft.experienceMin}-${draft.experienceMax} years experience` : "";

  return (
    <div className="space-y-6">
      {standalone ? null : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            How your job post will appear to candidates
          </p>
        </div>
      )}

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
              {expLabel&&<span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                {expLabel}
              </span>}
             {draft.employmentType && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                {draft.employmentType}
              </span>}
              {lpa && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">
                {lpa}
              </span>}
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

            <section className="space-y-8">
              <h4 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                What we&apos;re looking for
              </h4>

              <div className="space-y-8">
                <div>
                  <div className="mb-3 flex items-center gap-2.5">
                    <Star
                      className="h-5 w-5 shrink-0 text-amber-500"
                      fill="currentColor"
                      strokeWidth={0}
                      aria-hidden
                    />
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      Mandatory Skills
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mandatorySkills.length
                      ? mandatorySkills.map((name, i) => (
                          <span
                            key={`m-${i}-${name}`}
                            className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-900 dark:bg-sky-500/20 dark:text-sky-100"
                          >
                            {name}
                          </span>
                        ))
                      : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                      )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2.5">
                    <Star
                      className="h-5 w-5 shrink-0 text-gray-400"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      Good-to-have Skills
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferredSkills.length
                      ? preferredSkills.map((name, i) => (
                          <span
                            key={`p-${i}-${name}`}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {name}
                          </span>
                        ))
                      : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                      )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2.5">
                    <Briefcase
                      className="h-5 w-5 shrink-0 text-gray-400"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      Additional Requirements
                    </h5>
                  </div>
                  {looksLikeHtml(draft.additionalRequirements) ? (
                    <PreviewRichBlock html={draft.additionalRequirements} empty="—" />
                  ) : linesFromBlock(draft.additionalRequirements).length > 0 ? (
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {linesFromBlock(draft.additionalRequirements).map((line, i) => (
                        <li key={i}>{line.replace(/^•\s*/, "")}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                  )}
                </div>
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
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  Apply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="gap-1.5"
                  disabled={!shareUrl}
                  title={
                    shareUrl
                      ? "Copy public job link"
                      : "Save the job opening first to get a shareable link"
                  }
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              {shareHint ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">{shareHint}</p>
              ) : null}
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

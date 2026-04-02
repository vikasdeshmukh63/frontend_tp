import JobOpeningPreviewPage from "@/components/resume-screening/job-opening/JobOpeningPreviewPage";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Job preview | ETIP",
};

export default async function PreviewRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">Invalid job opening id.</p>
    );
  }
  return <JobOpeningPreviewPage jobOpeningId={n} />;
}

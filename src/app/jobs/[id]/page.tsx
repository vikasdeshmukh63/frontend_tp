import JobPostLivePreview from "@/components/resume-screening/job-opening/JobPostLivePreview";
import { getPublicJobOpening } from "@/features/job-opening/api/public-job-opening";
import { mapStoredJobDataToDraft } from "@/features/job-opening/utils/map-stored-job-to-draft";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) {
    return { title: "Job | ETIP" };
  }
  try {
    const job = await getPublicJobOpening(n);
    const title =
      job.job_title ??
      (typeof job.data?.job_title === "string" ? job.data.job_title : null) ??
      "Job";
    return { title: `${title} | ETIP` };
  } catch {
    return { title: "Job | ETIP" };
  }
}

export default async function PublicJobPage({ params }: Props) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) {
    notFound();
  }

  try {
    const job = await getPublicJobOpening(n);
    const draft = mapStoredJobDataToDraft(job.data as Record<string, unknown>);
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-4 dark:bg-gray-950 md:p-8">
        <div className="mx-auto max-w-4xl">
          <JobPostLivePreview draft={draft} standalone shareJobOpeningId={n} />
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

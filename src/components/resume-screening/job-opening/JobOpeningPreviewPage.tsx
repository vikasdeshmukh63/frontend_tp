"use client";

import { getJobOpening } from "@/features/job-opening/api/get-job-opening";
import { mapStoredJobDataToDraft } from "@/features/job-opening/utils/map-stored-job-to-draft";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import React from "react";
import JobPostLivePreview from "./JobPostLivePreview";

type Props = {
  jobOpeningId: number;
};

export default function JobOpeningPreviewPage({ jobOpeningId }: Props) {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ReturnType<typeof mapStoredJobDataToDraft> | null>(
    null,
  );

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Sign in to preview this job.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getJobOpening(jobOpeningId, token)
      .then((res) => {
        if (cancelled) return;
        setDraft(mapStoredJobDataToDraft(res.data as Record<string, unknown>));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not load this job opening.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, jobOpeningId]);

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!draft) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Preview — this is how candidates see the post when it is published.
        </p>
        <Link
          href={`/resume-screening/job-openings/${jobOpeningId}/edit`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Edit job
        </Link>
      </div>
      <JobPostLivePreview draft={draft} standalone shareJobOpeningId={jobOpeningId} />
    </div>
  );
}

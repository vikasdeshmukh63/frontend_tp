"use client";

import PageContentLayout from "@/components/common/PageContentLayout";
import { getJobOpening } from "@/features/job-opening/api/get-job-opening";
import { mapStoredJobDataToDraft } from "@/features/job-opening/utils/map-stored-job-to-draft";
import { ApiError } from "@/lib/api/client";
import {
  useJobOpeningDraftHydrated,
  useJobOpeningDraftStore,
} from "@/stores/job-opening-draft-store";
import { useAuthStore } from "@/stores/auth-store";
import React from "react";
import JdExtractionLoader from "./JdExtractionLoader";
import JobOpeningWizard from "./JobOpeningWizard";

type Props = {
  jobOpeningId: number;
};

export default function EditJobOpeningFlow({ jobOpeningId }: Props) {
  const hydrated = useJobOpeningDraftHydrated();
  const token = useAuthStore((s) => s.token);
  const enterEditWizard = useJobOpeningDraftStore((s) => s.enterEditWizard);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Sign in to edit this job opening.");
      return;
    }
    if (!Number.isFinite(jobOpeningId) || jobOpeningId <= 0) {
      setLoading(false);
      setError("Invalid job opening.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setReady(false);

    getJobOpening(jobOpeningId, token)
      .then((res) => {
        if (cancelled) return;
        const draft = mapStoredJobDataToDraft(res.data as Record<string, unknown>);
        useJobOpeningDraftStore.persist.clearStorage();
        enterEditWizard(draft, jobOpeningId);
        setReady(true);
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
  }, [token, jobOpeningId, enterEditWizard]);

  if (!hydrated || loading) {
    return (
      <PageContentLayout
        title="Edit job opening"
        subtitle="Loading…"
        panelClassName="min-h-[min(520px,65vh)] border-0 bg-gradient-to-b from-[#f8f9fc] to-white shadow-none dark:bg-transparent dark:[background-image:none]"
      >
        <JdExtractionLoader />
      </PageContentLayout>
    );
  }

  if (error) {
    return (
      <PageContentLayout title="Edit job opening" subtitle="Something went wrong">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </PageContentLayout>
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit job opening</h1>
      <JobOpeningWizard />
    </div>
  );
}

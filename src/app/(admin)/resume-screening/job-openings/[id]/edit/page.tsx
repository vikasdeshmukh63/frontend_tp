import EditJobOpeningFlow from "@/components/resume-screening/job-opening/EditJobOpeningFlow";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Edit job opening | ETIP",
};

export default async function EditJobOpeningPage({
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
  return <EditJobOpeningFlow jobOpeningId={n} />;
}

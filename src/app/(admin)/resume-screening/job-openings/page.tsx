import PageContentLayout from "@/components/common/PageContentLayout";
import JobOpeningsEmptyState from "@/components/resume-screening/JobOpeningsEmptyState";
import { PlusIcon } from "@/components/ui/plus-icon";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";


export const metadata: Metadata = {
  title: "Job openings | ETIP",
};

export default function JobOpeningsPage() {
  return (
    <PageContentLayout
      title="Job Openings"
      subtitle="Create job posts, configure candidate application forms and pipelines"
      headerAction={
        <Link
          href="/resume-screening/job-openings/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <PlusIcon/> Job Opening
        </Link>
      }
    >
      <JobOpeningsEmptyState />
    </PageContentLayout>
  );
}

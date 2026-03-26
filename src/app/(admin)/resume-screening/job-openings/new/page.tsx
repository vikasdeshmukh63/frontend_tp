import NewJobOpeningFlow from "@/components/resume-screening/job-opening/NewJobOpeningFlow";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "New job opening | ETIP",
};

export default function NewJobOpeningPage() {
  return <NewJobOpeningFlow />;
}

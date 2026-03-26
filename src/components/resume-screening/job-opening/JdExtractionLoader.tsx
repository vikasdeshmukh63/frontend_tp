"use client";

import { Loader2 } from "lucide-react";
import React from "react";

export default function JdExtractionLoader() {
  return (
    <div
      className="flex min-h-[min(420px,55vh)] flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white/80 px-6 py-16 text-center backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/40"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-12 w-12 animate-spin text-brand-500 dark:text-brand-400" aria-hidden />
      <div className="space-y-1">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Extracting job details</p>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          We&apos;re reading your PDF and preparing an editable draft. This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}

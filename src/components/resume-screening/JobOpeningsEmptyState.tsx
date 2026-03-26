import React from "react";

interface JobOpeningsEmptyStateProps {
  message?: string;
}

/** Centered empty state for the job openings list (illustration + copy). */
export default function JobOpeningsEmptyState({
  message = "No job openings found. Create your first job opening to get started.",
}: JobOpeningsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div
        className="mb-6 text-gray-300 dark:text-gray-600"
        aria-hidden
      >
        <SleepyFolderIllustration className="mx-auto h-40 w-40 max-w-full" />
      </div>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}

function SleepyFolderIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 52c0-8.837 7.163-16 16-16h38l12 14h62c8.837 0 16 7.163 16 16v78c0 8.837-7.163 16-16 16H44c-8.837 0-16-7.163-16-16V52z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M44 50h38l12 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="78"
        cy="108"
        rx="6"
        ry="7"
        fill="currentColor"
        opacity="0.45"
      />
      <ellipse
        cx="122"
        cy="108"
        rx="6"
        ry="7"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M88 128c8 6 18 6 26 0"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M52 40c-2-6 2-12 8-10l6 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

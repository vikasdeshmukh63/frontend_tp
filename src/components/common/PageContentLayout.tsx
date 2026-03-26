import React from "react";
import { twMerge } from "tailwind-merge";

export interface PageContentLayoutProps {
  /** Main heading shown in the page header row */
  title: string;
  /** Optional line under the title (e.g. short description) */
  subtitle?: string;
  /** Right-aligned control in the header (e.g. primary action button) */
  headerAction?: React.ReactNode;
  /** Content rendered inside the bordered panel */
  children: React.ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
  /** Extra classes on the inner white panel */
  panelClassName?: string;
}

/**
 * Page section with a title row and a rounded bordered panel. Pass any content as `children`.
 */
export default function PageContentLayout({
  title,
  subtitle,
  headerAction,
  children,
  className = "",
  panelClassName = "",
}: PageContentLayoutProps) {
  return (
    <div className={className}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {headerAction ? (
          <div className="shrink-0 sm:pt-0.5">{headerAction}</div>
        ) : null}
      </div>

      <div
        className={twMerge(
          "min-h-[min(420px,50vh)] rounded-2xl border border-gray-200 bg-white px-5 py-10 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-14",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

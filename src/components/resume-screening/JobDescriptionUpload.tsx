"use client";

import clsx from "clsx";
import { FileText, Upload } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

const MAX_BYTES = 10 * 1024 * 1024;

type JobDescriptionUploadProps = {
  /** Called when a valid PDF is accepted */
  onFileAccepted?: (file: File) => void;
  /** Optional handlers for alternate flows */
  onStartFromScratch?: () => void;
  onStartFromSample?: () => void;
  onOpenSampleLink?: () => void;
};

export default function JobDescriptionUpload({
  onFileAccepted,
  onStartFromScratch,
  onStartFromSample,
  onOpenSampleLink,
}: JobDescriptionUploadProps) {
  const [selected, setSelected] = useState<File | null>(null);
  const [rejectMessage, setRejectMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      setRejectMessage(null);
      if (fileRejections.length > 0) {
        const r = fileRejections[0];
        const code = r.errors[0]?.code;
        if (code === "file-too-large") {
          setRejectMessage("File is larger than 10MB.");
        } else if (code === "file-invalid-type") {
          setRejectMessage("Please upload a PDF file.");
        } else {
          setRejectMessage("Could not use this file.");
        }
        setSelected(null);
        return;
      }
      if (accepted[0]) {
        setSelected(accepted[0]);
        onFileAccepted?.(accepted[0]);
      }
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_BYTES,
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center py-2">
      <div
        {...getRootProps({
          className: clsx(
            "flex w-full max-w-[500px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-10 outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-brand-400/40 dark:focus-visible:ring-offset-gray-900",
            isDragActive
              ? "border-brand-400 bg-brand-100 dark:border-brand-500/55 dark:bg-brand-500/15"
              : [
                  "border-[#A3C6ED] bg-[#F0F7FF]",
                  "dark:border-gray-600 dark:bg-gray-900/55",
                  "hover:border-brand-300 dark:hover:border-brand-500/45",
                ],
          ),
        })}
      >
        <input {...getInputProps()} />

        <FileText
          className={clsx(
            "h-14 w-14 shrink-0 text-[#1A438C]",
            "dark:text-brand-400",
          )}
          strokeWidth={1.5}
          aria-hidden
        />

        <h2
          className={clsx(
            "mt-5 text-center text-xl font-semibold text-[#1A438C]",
            "dark:text-gray-100",
          )}
        >
          Upload Job Description PDF
        </h2>
        <p
          className={clsx(
            "mt-2 max-w-sm text-center text-sm text-[#4A6FA8]",
            "dark:text-gray-400",
          )}
        >
          Drag & drop a PDF file here, or click to browse (max 10MB)
        </p>

        <span
          className={clsx(
            "pointer-events-none mt-6 inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium shadow-sm",
            "border-[#1A438C] bg-white text-[#1A438C]",
            "dark:border-brand-500/50 dark:bg-gray-950 dark:text-brand-300",
          )}
        >
          <Upload className="h-4 w-4" aria-hidden />
          Choose PDF File
        </span>

        {selected ? (
          <p className="mt-6 max-w-full truncate text-center text-sm font-medium text-gray-700 dark:text-gray-200">
            {selected.name}
          </p>
        ) : null}
        {rejectMessage ? (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {rejectMessage}
          </p>
        ) : null}
      </div>

      <p className="mt-8 max-w-lg text-center text-sm text-gray-500 dark:text-gray-400">
        You can also start{" "}
        <button
          type="button"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          onClick={() => onStartFromScratch?.()}
        >
          from scratch
        </button>{" "}
        or{" "}
        <button
          type="button"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          onClick={() => onStartFromSample?.()}
        >
          from a sample JD
        </button>{" "}
        (find the sample JD{" "}
        <button
          type="button"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          onClick={() => onOpenSampleLink?.()}
        >
          here
        </button>
        )
      </p>
    </div>
  );
}

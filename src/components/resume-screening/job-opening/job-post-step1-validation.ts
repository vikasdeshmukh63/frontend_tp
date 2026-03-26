import { jobPostStep1Schema } from "@/features/job-opening/schemas/job-post-step1.schema";
import type { JobPostDraft } from "@/types/job-post-draft";
import * as yup from "yup";

export type JobPostStep1FieldErrors = Partial<Record<string, string>>;

export type Step1ValidationResult = {
  ok: boolean;
  message: string | null;
  fieldErrors: JobPostStep1FieldErrors;
};

function collectFieldErrors(err: yup.ValidationError): JobPostStep1FieldErrors {
  const fieldErrors: JobPostStep1FieldErrors = {};
  for (const e of err.inner) {
    const path = e.path ?? "form";
    if (!fieldErrors[path]) {
      fieldErrors[path] = e.message;
    }
  }
  if (Object.keys(fieldErrors).length === 0 && err.message) {
    fieldErrors.form = err.message;
  }
  return fieldErrors;
}

export function validateJobPostStep1(draft: JobPostDraft): Step1ValidationResult {
  try {
    jobPostStep1Schema.validateSync(draft, { abortEarly: false });
    return { ok: true, message: null, fieldErrors: {} };
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      const fieldErrors = collectFieldErrors(e);
      const message =
        e.errors[0] ??
        Object.values(fieldErrors)[0] ??
        "Fix the highlighted fields to continue.";
      return { ok: false, message, fieldErrors };
    }
    return {
      ok: false,
      message: "Validation failed.",
      fieldErrors: { form: "Validation failed." },
    };
  }
}

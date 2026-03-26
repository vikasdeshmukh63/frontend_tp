import * as yup from "yup";
import {
  EMPLOYMENT_OPTIONS,
  SALARY_FREQUENCY_OPTIONS,
  SENIORITY_OPTIONS,
} from "@/components/resume-screening/job-opening/job-post-constants";

export function plainTextFromRich(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const YEARS_RE = /^\d+(\.\d+)?$/;

function parseYearString(v: string | undefined): number | null {
  if (v == null || v.trim() === "") return null;
  if (!YEARS_RE.test(v.trim())) return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

const skillRowSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().trim().min(1, "Skill name cannot be empty").required(),
  mandatory: yup.boolean().required(),
});

export const jobPostStep1Schema = yup.object({
  jobTitle: yup
    .string()
    .required()
    .transform((v) => (typeof v === "string" ? v.trim() : ""))
    .min(1, "Job title is required")
    .max(200, "Job title is too long (max 200 characters)"),

  role: yup.string().default(""),

  seniority: yup
    .string()
    .required("Seniority is required")
    .oneOf([...SENIORITY_OPTIONS], "Select a valid seniority"),

  experienceMin: yup
    .string()
    .required("Minimum years of experience is required")
    .matches(YEARS_RE, "Use a valid number (e.g. 2)"),

  experienceMax: yup
    .string()
    .required("Maximum years of experience is required")
    .matches(YEARS_RE, "Use a valid number (e.g. 6)")
    .test(
      "max-gte-min",
      "Max experience must be greater than or equal to min",
      function maxGteMin(value) {
        const min = parseYearString(this.parent.experienceMin);
        const max = parseYearString(value);
        if (min == null || max == null) return true;
        return max >= min;
      },
    ),

  employmentType: yup
    .string()
    .required("Employment type is required")
    .oneOf([...EMPLOYMENT_OPTIONS], "Select a valid employment type"),

  salaryCurrency: yup.string().required(),
  salaryMin: yup.string().default(""),
  salaryMax: yup.string().default(""),
  salaryFrequency: yup
    .string()
    .required()
    .oneOf([...SALARY_FREQUENCY_OPTIONS], "Select salary frequency"),

  workArrangement: yup
    .string()
    .oneOf(["on-site", "hybrid", "remote"])
    .required("Work arrangement is required"),

  hybridPolicy: yup.string().default(""),

  locations: yup
    .array(yup.string().required())
    .when("workArrangement", {
      is: "hybrid",
      then: (schema) =>
        schema.min(1, "Add at least one work location for hybrid roles"),
      otherwise: (schema) => schema.default([]),
    }),

  jobSummary: yup
    .string()
    .required()
    .test(
      "non-empty-html",
      "Job summary is required",
      (v) => plainTextFromRich(v ?? "").length > 0,
    ),

  responsibilities: yup.string().default(""),
  perks: yup.string().default(""),

  skills: yup
    .array(skillRowSchema)
    .min(1, "Add at least one skill")
    .required(),

  minEducation: yup.string().default(""),
  courseSpecialization: yup.string().default(""),
  additionalRequirements: yup.string().default(""),

  status: yup.string().required(),
  applicationDeadline: yup.string().default(""),
  employmentStartDate: yup.string().default(""),
  keyCallout: yup.string().default(""),

  mapsUrl: yup
    .string()
    .default("")
    .test(
      "url-or-empty",
      "Enter a valid URL starting with http:// or https://",
      (v) => !v?.trim() || /^https?:\/\/.+/i.test(v.trim()),
    ),
})
  .test("salary-range", function validateSalaryRange(value) {
    const minS = value?.salaryMin?.trim() ?? "";
    const maxS = value?.salaryMax?.trim() ?? "";
    if (!minS && !maxS) return true;
    const minN = minS ? Number.parseFloat(minS.replace(/,/g, "")) : NaN;
    const maxN = maxS ? Number.parseFloat(maxS.replace(/,/g, "")) : NaN;
    if (minS && Number.isNaN(minN)) {
      return this.createError({
        path: "salaryMin",
        message: "Enter a valid minimum salary",
      });
    }
    if (maxS && Number.isNaN(maxN)) {
      return this.createError({
        path: "salaryMax",
        message: "Enter a valid maximum salary",
      });
    }
    if (!Number.isNaN(minN) && !Number.isNaN(maxN) && minN > maxN) {
      return this.createError({
        path: "salaryMax",
        message: "Maximum salary must be greater than or equal to minimum",
      });
    }
    return true;
  })
  .test("experience-non-negative", function validateExpNonNeg(value) {
    const min = parseYearString(value?.experienceMin);
    const max = parseYearString(value?.experienceMax);
    if (min != null && min < 0) {
      return this.createError({
        path: "experienceMin",
        message: "Experience cannot be negative",
      });
    }
    if (max != null && max < 0) {
      return this.createError({
        path: "experienceMax",
        message: "Experience cannot be negative",
      });
    }
    return true;
  });

import { bulletListHtmlFromLines, normalizePlainTextToHtml } from "@/lib/rich-text-html";
import { getDefaultCandidatePipeline } from "@/types/candidate-pipeline";
import { getDefaultApplicationForm } from "@/types/application-form";
import type { JobPostDraft, SkillTag, WorkArrangement } from "@/types/job-post-draft";
import type { JdExtractionResponse } from "@/types/jd-extraction";

export function newSkillId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapWorkArrangement(
  v: JdExtractionResponse["work_arrangement"],
): WorkArrangement {
  if (v === "onsite") return "on-site";
  if (v === "hybrid") return "hybrid";
  if (v === "remote") return "remote";
  return "hybrid";
}

function mapSalaryFrequency(
  t: JdExtractionResponse["salary_range_type"],
): JobPostDraft["salaryFrequency"] {
  switch (t) {
    case "monthly":
      return "Monthly";
    case "hourly":
      return "Hourly";
    case "yearly":
    case "fixed":
    case "weekly":
    case "other":
    default:
      return "Yearly";
  }
}

function normalizeSeniority(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const s = raw.trim();
  const lower = s.toLowerCase();
  const map: Record<string, string> = {
    intern: "Intern",
    junior: "Junior",
    "mid-level": "Mid-level",
    mid: "Mid-level",
    "mid level": "Mid-level",
    senior: "Senior",
    lead: "Lead",
    principal: "Principal",
    staff: "Senior",
  };
  if (map[lower]) return map[lower];
  const options = [
    "Intern",
    "Junior",
    "Mid-level",
    "Senior",
    "Lead",
    "Principal",
  ] as const;
  const hit = options.find((o) => o.toLowerCase() === lower);
  return hit ?? s;
}

function normalizeEmploymentType(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const lower = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    "full-time": "Full-time",
    "full time": "Full-time",
    fulltime: "Full-time",
    "part-time": "Part-time",
    "part time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    intern: "Internship",
    freelance: "Contract",
  };
  return map[lower] ?? raw.trim();
}

function summaryToHtml(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  const t = text.trim();
  if (t.startsWith("<")) return t;
  return normalizePlainTextToHtml(t);
}

function parseDateHint(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const t = raw.trim();
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(t);
  if (iso) return iso[0];
  return t;
}

export function jdExtractionToJobPostDraft(
  jd: JdExtractionResponse,
): JobPostDraft {
  const minFromApi =
    jd.experience_min_years != null && !Number.isNaN(jd.experience_min_years)
      ? jd.experience_min_years
      : jd.experience_years != null && !Number.isNaN(jd.experience_years)
        ? jd.experience_years
        : null;
  const maxFromApi =
    jd.experience_max_years != null && !Number.isNaN(jd.experience_max_years)
      ? jd.experience_max_years
      : null;

  const expMin =
    minFromApi != null ? String(Math.max(0, Math.floor(minFromApi))) : "";
  let expMax = "";
  if (maxFromApi != null) {
    expMax = String(Math.max(Math.floor(minFromApi ?? maxFromApi), Math.floor(maxFromApi)));
  } else if (minFromApi != null) {
    expMax = String(Math.max(Math.floor(minFromApi), Math.floor(minFromApi) + 2));
  }

  const skills: SkillTag[] = (jd.skills ?? []).map((s) => ({
    id: newSkillId(),
    name: s.name.trim(),
    mandatory: s.is_mandatory,
  }));

  const locations: string[] = [];
  const fromList = (jd.locations ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromList.length) {
    locations.push(...fromList);
  } else if (jd.location?.trim()) {
    jd.location
      .split(/[,;]|(?:\s+and\s+)/i)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => locations.push(s));
  }

  const responsibilities = bulletListHtmlFromLines(jd.responsibilities ?? []);
  const perks = bulletListHtmlFromLines(jd.perks_and_benefits ?? []);
  const additional = bulletListHtmlFromLines(jd.additional_requirements ?? []);

  const salaryMin =
    jd.salary_min != null && !Number.isNaN(jd.salary_min)
      ? String(Math.round(jd.salary_min))
      : "";
  const salaryMax =
    jd.salary_max != null && !Number.isNaN(jd.salary_max)
      ? String(Math.round(jd.salary_max))
      : "";

  const statusRaw = jd.status_of_jd?.toLowerCase() ?? "";
  let status: JobPostDraft["status"] = "Draft";
  if (statusRaw.includes("publish") || statusRaw.includes("active")) {
    status = "Published";
  } else if (statusRaw.includes("close")) {
    status = "Closed";
  }

  return {
    jobTitle: jd.job_title?.trim() ?? "",
    role: jd.role?.trim() ?? "",
    seniority: normalizeSeniority(jd.seniority),
    experienceMin: expMin,
    experienceMax: expMax,
    employmentType: normalizeEmploymentType(jd.employment_type),
    salaryCurrency: (jd.salary_currency?.trim() || "INR").toUpperCase(),
    salaryMin,
    salaryMax,
    salaryFrequency: mapSalaryFrequency(jd.salary_range_type),
    workArrangement: mapWorkArrangement(jd.work_arrangement),
    hybridPolicy: jd.policy?.trim() ?? "",
    locations,
    jobSummary: summaryToHtml(jd.job_summary),
    responsibilities,
    perks,
    skills,
    minEducation: jd.minimum_education_qualification?.trim() ?? "",
    courseSpecialization: jd.course_or_specialization?.trim() ?? "",
    additionalRequirements: additional,
    status,
    applicationDeadline: parseDateHint(jd.application_deadline),
    employmentStartDate: parseDateHint(jd.employment_start_date),
    keyCallout: jd.key_callout?.trim() ?? "",
    mapsUrl: jd.google_maps_url_of_office_location?.trim() ?? "",
    applicationForm: getDefaultApplicationForm(),
    candidatePipeline: getDefaultCandidatePipeline(),
  };
}

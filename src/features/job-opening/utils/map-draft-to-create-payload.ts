import type { ApplicationFormState } from "@/types/application-form";
import type { CandidatePipelineState, PipelineStageTemplate } from "@/types/candidate-pipeline";
import type { JobPostDraft } from "@/types/job-post-draft";
import { htmlToTiptapJson } from "./html-to-tiptap-json";

const LAKH_INR = 100_000;

function toAnnualRupees(salaryStr: string): number {
  const raw = Number.parseFloat(String(salaryStr ?? "").replace(/,/g, "")) || 0;
  if (raw <= 0) return 0;
  const lakhs = raw >= LAKH_INR ? raw / LAKH_INR : raw;
  return lakhs * LAKH_INR;
}

/** Backend expects salary × 100 (e.g. 12 LPA → 120000000). */
function salaryToTimesHundred(salaryStr: string): number {
  const annual = toAnnualRupees(salaryStr);
  return Math.round(annual * 100);
}

function parseEnvInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseEnvIdList(name: string): number[] {
  const v = process.env[name];
  if (!v?.trim()) return [];
  return v
    .split(",")
    .map((x) => Number.parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

const WORK_ARRANGEMENT_API: Record<JobPostDraft["workArrangement"], string> = {
  "on-site": "ONSITE",
  hybrid: "HYBRID",
  remote: "REMOTE",
};

const SENIORITY_API: Record<string, string> = {
  Intern: "INTERN",
  Junior: "JUNIOR",
  "Mid-level": "MID",
  Senior: "SENIOR",
  Lead: "LEAD",
  Principal: "PRINCIPAL",
};

const EMPLOYMENT_API: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
  Internship: "INTERNSHIP",
};

const SALARY_FREQ_API: Record<string, string> = {
  Yearly: "YEARLY",
  Monthly: "MONTHLY",
  Hourly: "HOURLY",
};

const TEMPLATE_TO_STAGE_TYPE: Record<PipelineStageTemplate, string> = {
  phone_screening: "PHONE_SCREENING",
  assessment: "ASSESSMENT",
  one_way_ai: "ONE_WAY_AI",
  conversational_ai: "CONVERSATIONAL_AI",
  video_interview: "VIDEO_INTERVIEW",
  custom: "CUSTOM",
};

function mapStandardFields(app: ApplicationFormState) {
  const m = (t: { enabled: boolean; mandatory: boolean }) =>
    t.enabled ? { mandatory: t.mandatory } : { mandatory: false };

  return {
    first_name: m(app.basicInfo.firstName),
    last_name: m(app.basicInfo.lastName),
    email: m(app.basicInfo.email),
    phone: m(app.basicInfo.phone),
    work_experience: m(app.professionalInfo.workExperience),
    education: m(app.professionalInfo.education),
    skills: m(app.professionalInfo.skills),
    resume: m(app.additionalInfo.cvResume),
    notice_period: m(app.additionalInfo.noticePeriod),
  };
}

function mapCustomFields(app: ApplicationFormState) {
  return app.customFields.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type.toUpperCase() as "INTEGER" | "BOOLEAN" | "DATE",
    placeholder: f.placeholder ?? "",
  }));
}

function mapScreeningQuestions(app: ApplicationFormState) {
  return app.screeningQuestions.map((q) => {
    if (q.type === "objective") {
      return {
        id: q.id,
        question: q.question,
        type: "OBJECTIVE" as const,
        options: (q.objectiveOptions ?? []).filter((s) => s.trim()),
      };
    }
    return {
      id: q.id,
      question: q.question,
      type: "TEXT" as const,
      placeholder: q.placeholder ?? "",
    };
  });
}

function parseAvailability(status: string): string {
  const s = (status ?? "").trim().toUpperCase();
  if (s === "ACTIVE" || s === "DRAFT" || s === "CLOSED" || s === "PAUSED") return s;
  return "ACTIVE";
}

function parseDateOrNull(s: string): string | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  return t;
}

/**
 * Builds the `data` object for `POST /api/job-openings` (recruiter service).
 * Numeric IDs (`role_id`, `city_ids`, skills) come from env when the draft only has labels.
 */
export function mapJobDraftToCreatePayload(
  draft: JobPostDraft,
  pipeline: CandidatePipelineState,
): Record<string, unknown> {
  const roleId = parseEnvInt("NEXT_PUBLIC_RECRUITER_DEFAULT_ROLE_ID", 1);
  const cityIds = parseEnvIdList("NEXT_PUBLIC_RECRUITER_DEFAULT_CITY_IDS");
  const mandatorySkillIds = parseEnvIdList("NEXT_PUBLIC_RECRUITER_DEFAULT_MANDATORY_SKILL_IDS");
  const preferredSkillIds = parseEnvIdList("NEXT_PUBLIC_RECRUITER_DEFAULT_PREFERRED_SKILL_IDS");

  const mandatoryFromDraft = draft.skills.filter((s) => s.mandatory).map((s) => parseInt(s.id, 10));
  const preferredFromDraft = draft.skills.filter((s) => !s.mandatory).map((s) => parseInt(s.id, 10));
  const useDraftSkillIds =
    mandatoryFromDraft.every((n) => Number.isFinite(n)) &&
    preferredFromDraft.every((n) => Number.isFinite(n)) &&
    (mandatoryFromDraft.length > 0 || preferredFromDraft.length > 0);

  const minYoe = Math.max(0, Number.parseInt(draft.experienceMin, 10) || 0);
  const maxYoe = Math.max(minYoe, Number.parseInt(draft.experienceMax, 10) || minYoe);

  const employment =
    EMPLOYMENT_API[draft.employmentType] ??
    (draft.employmentType.trim() ? "OTHER" : "OTHER");
  const seniority = SENIORITY_API[draft.seniority] ?? "MID";

  const jobOpeningStageConfig: Array<{
    stage_type: string;
    stage_name: string;
    internal_name: string | null;
  }> = [
    { stage_type: "APPLIED", stage_name: "Applied", internal_name: null },
  ];

  const jobTitle = draft.jobTitle.trim();
  for (const m of pipeline.middleStages) {
    const st = TEMPLATE_TO_STAGE_TYPE[m.template] ?? "CUSTOM";
    const name = String(m.stageName ?? "").trim() || "Stage";
    const internalName = String(m.internalName ?? "").trim() || jobTitle || null;
    jobOpeningStageConfig.push({
      stage_type: st,
      stage_name: name,
      internal_name: internalName,
    });
  }

  jobOpeningStageConfig.push(
    { stage_type: "OFFERED", stage_name: "Offered", internal_name: null },
    { stage_type: "HIRED", stage_name: "Hired", internal_name: null },
    { stage_type: "REJECTED", stage_name: "Rejected", internal_name: null },
    { stage_type: "WITHDRAWN", stage_name: "Withdrawn", internal_name: null },
  );

  const app = draft.applicationForm;

  return {
    job_title: jobTitle,
    role_id: roleId,
    min_yoe: minYoe,
    max_yoe: maxYoe,
    employment_type: employment,
    seniority_level: seniority,
    job_post: {
      work_arrangement: WORK_ARRANGEMENT_API[draft.workArrangement] ?? "HYBRID",
      city_ids: cityIds.length > 0 ? cityIds : [],
      location_restrictions: draft.locations.join(", ") || "",
      timezone_restriction_hours: null,
      timezone_restriction_zone: "",
      hybrid_policy_description: draft.hybridPolicy || "",
      mandatory_skill_ids: useDraftSkillIds ? mandatoryFromDraft : mandatorySkillIds,
      preferred_skill_ids: useDraftSkillIds ? preferredFromDraft : preferredSkillIds,
      min_salary_times_hundred: salaryToTimesHundred(draft.salaryMin),
      max_salary_times_hundred: Math.max(
        salaryToTimesHundred(draft.salaryMin),
        salaryToTimesHundred(draft.salaryMax),
      ),
      salary_currency: draft.salaryCurrency || "INR",
      salary_frequency: SALARY_FREQ_API[draft.salaryFrequency] ?? "YEARLY",
      minimum_education_qualification: draft.minEducation || "",
      job_summary_tiptap_json: htmlToTiptapJson(draft.jobSummary),
      responsibilities_tiptap_json: htmlToTiptapJson(draft.responsibilities),
      perks_tiptap_json: htmlToTiptapJson(draft.perks),
      additional_requirements_tiptap_json: htmlToTiptapJson(draft.additionalRequirements),
      employment_start_date: parseDateOrNull(draft.employmentStartDate),
      application_deadline: parseDateOrNull(draft.applicationDeadline),
      key_callout: draft.keyCallout || "",
      jd_original_source_url: draft.mapsUrl || "",
      job_fit_criteria: null,
      availability_status: parseAvailability(draft.status),
      job_application_form: {
        fields: {
          standard_fields: mapStandardFields(app),
          custom_fields: mapCustomFields(app),
          screening_questions: mapScreeningQuestions(app),
        },
      },
      course_specialization: draft.courseSpecialization || "",
    },
    job_opening_stage_config: jobOpeningStageConfig,
  };
}

import { getEmptyJobPostDraft } from "@/components/resume-screening/job-opening/mockJobPostData";
import {
  createAppFieldToggle,
  getDefaultApplicationForm,
  type ApplicationFormState,
  type AppFieldToggle,
  type CustomFieldDef,
  type ScreeningQuestionDef,
} from "@/types/application-form";
import {
  getDefaultCandidatePipeline,
  newPipelineStageId,
  type CandidatePipelineState,
  type PipelineMiddleStage,
  type PipelineStageTemplate,
} from "@/types/candidate-pipeline";
import type { JobPostDraft, SkillTag, WorkArrangement } from "@/types/job-post-draft";

import { tiptapJsonToHtml } from "./tiptap-json-to-html";

const STAGE_TYPE_TO_TEMPLATE: Record<string, PipelineStageTemplate> = {
  PHONE_SCREENING: "phone_screening",
  ASSESSMENT: "assessment",
  ONE_WAY_AI: "one_way_ai",
  CONVERSATIONAL_AI: "conversational_ai",
  VIDEO_INTERVIEW: "video_interview",
  CUSTOM: "custom",
};

const EMPLOYMENT_FROM_API: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  OTHER: "Other",
};

const SENIORITY_FROM_API: Record<string, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

const WORK_FROM_API: Record<string, WorkArrangement> = {
  ONSITE: "on-site",
  HYBRID: "hybrid",
  REMOTE: "remote",
};

const SALARY_FREQ_FROM_API: Record<string, string> = {
  YEARLY: "Yearly",
  MONTHLY: "Monthly",
  HOURLY: "Hourly",
};

function timesHundredToAnnualString(timesHundred: unknown): string {
  const n = typeof timesHundred === "number" ? timesHundred : Number(timesHundred);
  if (!Number.isFinite(n) || n <= 0) return "";
  const annual = Math.round(n / 100);
  return String(annual);
}

function overlayToggle(def: AppFieldToggle, api: { mandatory?: boolean } | undefined): AppFieldToggle {
  if (!api) return def;
  if (api.mandatory === true) return createAppFieldToggle(true, true);
  return createAppFieldToggle(def.enabled, false);
}

function availabilityToDraftStatus(s: string): string {
  switch (s.trim().toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "ACTIVE":
      return "Published";
    case "CLOSED":
      return "Archived";
    case "PAUSED":
      return "Hidden";
    default:
      return "Published";
  }
}

function mapStandardFieldsToApplicationForm(
  raw: unknown,
  base: ApplicationFormState,
): ApplicationFormState {
  const sf =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, { mandatory?: boolean }>)
      : {};

  return {
    ...base,
    basicInfo: {
      ...base.basicInfo,
      firstName: overlayToggle(base.basicInfo.firstName, sf.first_name),
      lastName: overlayToggle(base.basicInfo.lastName, sf.last_name),
      email: overlayToggle(base.basicInfo.email, sf.email),
      phone: overlayToggle(base.basicInfo.phone, sf.phone),
    },
    professionalInfo: {
      ...base.professionalInfo,
      workExperience: overlayToggle(base.professionalInfo.workExperience, sf.work_experience),
      education: overlayToggle(base.professionalInfo.education, sf.education),
      skills: overlayToggle(base.professionalInfo.skills, sf.skills),
    },
    additionalInfo: {
      ...base.additionalInfo,
      cvResume: overlayToggle(base.additionalInfo.cvResume, sf.resume),
      noticePeriod: overlayToggle(base.additionalInfo.noticePeriod, sf.notice_period),
    },
  };
}

function mapCustomFieldsFromApi(raw: unknown): CustomFieldDef[] {
  if (!Array.isArray(raw)) return [];
  const out: CustomFieldDef[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const o = row as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : String(o.id ?? "");
    const name = typeof o.name === "string" ? o.name : "";
    const typeRaw = typeof o.type === "string" ? o.type.toLowerCase() : "integer";
    const type =
      typeRaw === "boolean" || typeRaw === "date" || typeRaw === "integer"
        ? typeRaw
        : "integer";
    if (!id || !name) continue;
    out.push({
      id,
      name,
      type,
      placeholder: typeof o.placeholder === "string" ? o.placeholder : "",
    });
  }
  return out;
}

function mapScreeningFromApi(raw: unknown): ScreeningQuestionDef[] {
  if (!Array.isArray(raw)) return [];
  const out: ScreeningQuestionDef[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const o = row as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : String(o.id ?? "");
    const question = typeof o.question === "string" ? o.question : "";
    const typeUpper = typeof o.type === "string" ? o.type.toUpperCase() : "TEXT";
    if (!id || !question) continue;
    if (typeUpper === "OBJECTIVE") {
      const options = Array.isArray(o.options)
        ? (o.options as unknown[]).filter((x): x is string => typeof x === "string")
        : [];
      out.push({
        id,
        question,
        type: "objective",
        objectiveOptions: options,
      });
    } else {
      out.push({
        id,
        question,
        type: "text",
        placeholder: typeof o.placeholder === "string" ? o.placeholder : "",
      });
    }
  }
  return out;
}

function mapSkillsFromApiIds(mandatoryIds: unknown, preferredIds: unknown): SkillTag[] {
  const m = Array.isArray(mandatoryIds) ? mandatoryIds : [];
  const p = Array.isArray(preferredIds) ? preferredIds : [];
  const out: SkillTag[] = [];
  for (const x of m) {
    const id = typeof x === "number" ? x : Number(x);
    if (!Number.isFinite(id)) continue;
    out.push({ id: String(id), name: `Skill ${id}`, mandatory: true });
  }
  for (const x of p) {
    const id = typeof x === "number" ? x : Number(x);
    if (!Number.isFinite(id)) continue;
    out.push({ id: String(id), name: `Skill ${id}`, mandatory: false });
  }
  return out;
}

function coerceSkillMandatory(v: unknown): boolean {
  if (v === true) return true;
  if (v === false) return false;
  if (v === "true" || v === 1) return true;
  if (v === "false" || v === 0) return false;
  return false;
}

/** Prefer persisted snapshot (UUID / display names); fall back to numeric catalog IDs. */
function mapSkillsFromJobPost(jobPost: Record<string, unknown>): SkillTag[] {
  const snap = jobPost.skill_tags_snapshot;
  if (Array.isArray(snap) && snap.length > 0) {
    const out: SkillTag[] = [];
    for (const row of snap) {
      if (!row || typeof row !== "object" || Array.isArray(row)) continue;
      const o = row as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : String(o.id ?? "");
      const name = typeof o.name === "string" ? o.name.trim() : "";
      if (!id || !name) continue;
      out.push({ id, name, mandatory: coerceSkillMandatory(o.mandatory) });
    }
    if (out.length > 0) return out;
  }
  return mapSkillsFromApiIds(jobPost.mandatory_skill_ids, jobPost.preferred_skill_ids);
}

function mapPipelineFromApi(raw: unknown): CandidatePipelineState {
  if (!Array.isArray(raw)) return getDefaultCandidatePipeline();

  const appliedIdx = raw.findIndex(
    (s) =>
      s &&
      typeof s === "object" &&
      !Array.isArray(s) &&
      String((s as Record<string, unknown>).stage_type ?? "").toUpperCase() === "APPLIED",
  );
  const offeredIdx = raw.findIndex(
    (s) =>
      s &&
      typeof s === "object" &&
      !Array.isArray(s) &&
      String((s as Record<string, unknown>).stage_type ?? "").toUpperCase() === "OFFERED",
  );

  if (appliedIdx < 0 || offeredIdx < 0 || offeredIdx <= appliedIdx) {
    return getDefaultCandidatePipeline();
  }

  const middle: PipelineMiddleStage[] = [];
  for (let i = appliedIdx + 1; i < offeredIdx; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const o = row as Record<string, unknown>;
    const st = String(o.stage_type ?? "").toUpperCase();
    const template = STAGE_TYPE_TO_TEMPLATE[st] ?? "custom";
    const stageName = typeof o.stage_name === "string" ? o.stage_name : "Stage";
    const internalName = typeof o.internal_name === "string" ? o.internal_name : "";
    const aid = o.assignee_recruiter_user_id;
    const assigneeId =
      typeof aid === "number" && Number.isFinite(aid) && aid > 0
        ? String(aid)
        : aid === null
          ? null
          : null;
    middle.push({
      id: newPipelineStageId(),
      template,
      stageName,
      internalName,
      assigneeId,
    });
  }

  return { middleStages: middle };
}

/**
 * Rebuilds a `JobPostDraft` from the persisted `data` object returned by the recruiter API.
 */
export function mapStoredJobDataToDraft(data: Record<string, unknown>): JobPostDraft {
  const empty = getEmptyJobPostDraft();
  const jp = data.job_post;
  const jobPost =
    jp && typeof jp === "object" && !Array.isArray(jp) ? (jp as Record<string, unknown>) : {};

  const employmentRaw = String(data.employment_type ?? "").toUpperCase();
  const employmentType = EMPLOYMENT_FROM_API[employmentRaw] ?? "Full-time";

  const seniorityRaw = String(data.seniority_level ?? "").toUpperCase();
  const seniority = SENIORITY_FROM_API[seniorityRaw] ?? "Mid-level";

  const workRaw = String(jobPost.work_arrangement ?? "").toUpperCase();
  const workArrangement: WorkArrangement = WORK_FROM_API[workRaw] ?? "hybrid";

  const salaryFreqRaw = String(jobPost.salary_frequency ?? "").toUpperCase();
  const salaryFrequency = SALARY_FREQ_FROM_API[salaryFreqRaw] ?? "Yearly";

  const availability = String(jobPost.availability_status ?? "ACTIVE");
  const status = availabilityToDraftStatus(availability);

  const jaf = jobPost.job_application_form;
  let applicationForm = getDefaultApplicationForm();
  if (jaf && typeof jaf === "object" && !Array.isArray(jaf)) {
    const fields = (jaf as Record<string, unknown>).fields;
    if (fields && typeof fields === "object" && !Array.isArray(fields)) {
      const f = fields as Record<string, unknown>;
      const standard = f.standard_fields;
      applicationForm = mapStandardFieldsToApplicationForm(standard, applicationForm);
      applicationForm = {
        ...applicationForm,
        customFields: mapCustomFieldsFromApi(f.custom_fields),
        screeningQuestions: mapScreeningFromApi(f.screening_questions),
      };
    }
  }

  const locRaw = jobPost.location_restrictions;
  const locations =
    typeof locRaw === "string" && locRaw.trim()
      ? locRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const pipeline = mapPipelineFromApi(data.job_opening_stage_config);

  const title = typeof data.job_title === "string" ? data.job_title : empty.jobTitle;

  const draft: JobPostDraft = {
    ...empty,
    jobTitle: title,
    role: "",
    seniority,
    experienceMin: numStr(data.min_yoe),
    experienceMax: numStr(data.max_yoe),
    employmentType,
    salaryCurrency: typeof jobPost.salary_currency === "string" ? jobPost.salary_currency : "INR",
    salaryMin: timesHundredToAnnualString(jobPost.min_salary_times_hundred),
    salaryMax: timesHundredToAnnualString(jobPost.max_salary_times_hundred),
    salaryFrequency,
    workArrangement,
    hybridPolicy: typeof jobPost.hybrid_policy_description === "string" ? jobPost.hybrid_policy_description : "",
    locations,
    jobSummary: tiptapJsonToHtml(jobPost.job_summary_tiptap_json),
    responsibilities: tiptapJsonToHtml(jobPost.responsibilities_tiptap_json),
    perks: tiptapJsonToHtml(jobPost.perks_tiptap_json),
    additionalRequirements: tiptapJsonToHtml(jobPost.additional_requirements_tiptap_json),
    skills: mapSkillsFromJobPost(jobPost),
    minEducation: typeof jobPost.minimum_education_qualification === "string"
      ? jobPost.minimum_education_qualification
      : "",
    courseSpecialization: typeof jobPost.course_specialization === "string" ? jobPost.course_specialization : "",
    status,
    applicationDeadline: typeof jobPost.application_deadline === "string" ? jobPost.application_deadline : "",
    employmentStartDate: typeof jobPost.employment_start_date === "string" ? jobPost.employment_start_date : "",
    keyCallout: typeof jobPost.key_callout === "string" ? jobPost.key_callout : "",
    mapsUrl: typeof jobPost.jd_original_source_url === "string" ? jobPost.jd_original_source_url : "",
    applicationForm,
    candidatePipeline: pipeline,
  };

  return draft;
}

function numStr(v: unknown): string {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return "";
}

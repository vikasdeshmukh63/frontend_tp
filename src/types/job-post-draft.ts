import type { CandidatePipelineState } from "@/types/candidate-pipeline";
import type { ApplicationFormState } from "@/types/application-form";

export type WorkArrangement = "on-site" | "hybrid" | "remote";

export type SkillTag = {
  id: string;
  name: string;
  mandatory: boolean;
};

export type JobPostDraft = {
  jobTitle: string;
  role: string;
  seniority: string;
  experienceMin: string;
  experienceMax: string;
  employmentType: string;
  salaryCurrency: string;
  salaryMin: string;
  salaryMax: string;
  salaryFrequency: string;
  workArrangement: WorkArrangement;
  hybridPolicy: string;
  locations: string[];
  jobSummary: string;
  responsibilities: string;
  perks: string;
  skills: SkillTag[];
  minEducation: string;
  courseSpecialization: string;
  additionalRequirements: string;
  status: string;
  applicationDeadline: string;
  employmentStartDate: string;
  keyCallout: string;
  mapsUrl: string;
  /** Step 2 — application fields candidates fill (enabled / mandatory). */
  applicationForm: ApplicationFormState;
  /** Step 3 — hiring pipeline stages between Applied and terminal outcomes. */
  candidatePipeline: CandidatePipelineState;
};

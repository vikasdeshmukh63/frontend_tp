/**
 * Response shape from ai_service `POST /api/v1/parse-jd` (matches `jd_schema.py`).
 */
export type JdSalaryRangeType =
  | "yearly"
  | "monthly"
  | "weekly"
  | "hourly"
  | "fixed"
  | "other";

export type JdWorkArrangement = "onsite" | "hybrid" | "remote";

export type JdSkillItem = {
  name: string;
  is_mandatory: boolean;
};

export type JdExtractionResponse = {
  job_title: string | null;
  role: string | null;
  seniority: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  experience_years: number | null;
  experience_months: number | null;
  employment_type: string | null;
  salary_currency: string | null;
  salary_range_type: JdSalaryRangeType | null;
  salary_min: number | null;
  salary_max: number | null;
  work_arrangement: JdWorkArrangement | null;
  policy: string | null;
  /** Multiple place names when the API returns them; older responses may omit. */
  locations?: string[];
  location: string | null;
  job_summary: string | null;
  responsibilities: string[];
  perks_and_benefits: string[];
  skills: JdSkillItem[];
  minimum_education_qualification: string | null;
  course_or_specialization: string | null;
  additional_requirements: string[];
  status_of_jd: string | null;
  application_deadline: string | null;
  employment_start_date: string | null;
  key_callout: string | null;
  google_maps_url_of_office_location: string | null;
};

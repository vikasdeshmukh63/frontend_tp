/** Step 2 — which candidate application fields are enabled and required. */

export type AppFieldToggle = {
  enabled: boolean;
  /** When enabled, whether the field is required for submit. */
  mandatory: boolean;
};

export type CustomFieldType = "integer" | "boolean" | "date";

export type CustomFieldDef = {
  id: string;
  name: string;
  type: CustomFieldType;
  placeholder?: string;
};

export type ScreeningQuestionType = "text" | "objective";

export type ScreeningQuestionDef = {
  id: string;
  question: string;
  type: ScreeningQuestionType;
  placeholder?: string;
  /** When `type` is `objective`, candidate-facing answer choices (min 2 when saving). */
  objectiveOptions?: string[];
};

export type ApplicationFormState = {
  basicInfo: {
    firstName: AppFieldToggle;
    lastName: AppFieldToggle;
    email: AppFieldToggle;
    phone: AppFieldToggle;
    currentCity: AppFieldToggle;
    linkedIn: AppFieldToggle;
    yearOfBirth: AppFieldToggle;
  };
  professionalInfo: {
    workExperience: AppFieldToggle;
    education: AppFieldToggle;
    skills: AppFieldToggle;
    projectsCertifications: AppFieldToggle;
  };
  additionalInfo: {
    cvResume: AppFieldToggle;
    noticePeriod: AppFieldToggle;
    salaryExpectation: AppFieldToggle;
    portfolioUrls: AppFieldToggle;
    languagesKnown: AppFieldToggle;
    locationsOpenTo: AppFieldToggle;
  };
  customFields: CustomFieldDef[];
  screeningQuestions: ScreeningQuestionDef[];
};

export const APPLICATION_FORM_CUSTOM_FIELDS_MAX = 10;
export const APPLICATION_FORM_SCREENING_MAX = 5;
/** Max choices per objective screening question (builder UI). */
export const SCREENING_OBJECTIVE_OPTIONS_MAX = 10;

export function createAppFieldToggle(
  enabled: boolean,
  mandatory: boolean,
): AppFieldToggle {
  return { enabled, mandatory: enabled ? mandatory : false };
}

export function newEntityId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDefaultApplicationForm(): ApplicationFormState {
  const m = (e: boolean, r: boolean) => createAppFieldToggle(e, r);
  return {
    basicInfo: {
      firstName: m(true, true),
      lastName: m(true, true),
      email: m(true, true),
      phone: m(true, true),
      currentCity: m(false, false),
      linkedIn: m(false, false),
      yearOfBirth: m(false, false),
    },
    professionalInfo: {
      workExperience: m(true, true),
      education: m(true, true),
      skills: m(true, true),
      projectsCertifications: m(false, false),
    },
    additionalInfo: {
      cvResume: m(true, true),
      noticePeriod: m(true, false),
      salaryExpectation: m(false, false),
      portfolioUrls: m(false, false),
      languagesKnown: m(false, false),
      locationsOpenTo: m(false, false),
    },
    customFields: [],
    screeningQuestions: [],
  };
}

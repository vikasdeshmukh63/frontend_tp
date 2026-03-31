import type { ApplicationFormState } from "@/types/application-form";
import * as yup from "yup";

function hasAtLeastOneEnabledField(v: ApplicationFormState): boolean {
  const any = (t: { enabled: boolean }) => t.enabled;
  if (Object.values(v.basicInfo).some(any)) return true;
  if (Object.values(v.professionalInfo).some(any)) return true;
  if (Object.values(v.additionalInfo).some(any)) return true;
  if (v.customFields.length > 0) return true;
  if (v.screeningQuestions.length > 0) return true;
  return false;
}

const appFieldToggleSchema = yup
  .object({
    enabled: yup.boolean().required(),
    mandatory: yup.boolean().required(),
  })
  .test(
    "mandatory-only-when-enabled",
    "Mandatory must be off when the field is disabled",
    (v) => {
      if (!v) return true;
      if (!v.enabled && v.mandatory) return false;
      return true;
    },
  );

/** Validates one custom field row (used by the form and by inline “add field” save). */
export const customFieldItemSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().trim().min(1, "Field name is required").max(200).required(),
  type: yup.mixed<"integer" | "boolean" | "date">().oneOf(["integer", "boolean", "date"]).required(),
  placeholder: yup.string().max(500).optional(),
});

/** Validates one screening question row. */
export const screeningItemSchema = yup
  .object({
    id: yup.string().required(),
    question: yup.string().trim().min(1, "Question is required").max(2000).required(),
    type: yup.mixed<"text" | "objective">().oneOf(["text", "objective"]).required(),
    placeholder: yup.string().max(500).optional(),
    objectiveOptions: yup.array().of(yup.string().trim().min(1).max(200)).optional(),
  })
  .test(
    "objective-options",
    "Add at least two answer options for objective questions",
    (v) => {
      if (!v || v.type !== "objective") return true;
      const opts = (v.objectiveOptions ?? [])
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
      return opts.length >= 2;
    },
  );

/** Yup schema for step 2 application form configuration (aligned with `ApplicationFormState`). */
export const applicationFormSchema = yup
  .object({
    basicInfo: yup
      .object({
        firstName: appFieldToggleSchema.required(),
        lastName: appFieldToggleSchema.required(),
        email: appFieldToggleSchema.required(),
        phone: appFieldToggleSchema.required(),
        currentCity: appFieldToggleSchema.required(),
        linkedIn: appFieldToggleSchema.required(),
        yearOfBirth: appFieldToggleSchema.required(),
      })
      .required(),
    professionalInfo: yup
      .object({
        workExperience: appFieldToggleSchema.required(),
        education: appFieldToggleSchema.required(),
        skills: appFieldToggleSchema.required(),
        projectsCertifications: appFieldToggleSchema.required(),
      })
      .required(),
    additionalInfo: yup
      .object({
        cvResume: appFieldToggleSchema.required(),
        noticePeriod: appFieldToggleSchema.required(),
        salaryExpectation: appFieldToggleSchema.required(),
        portfolioUrls: appFieldToggleSchema.required(),
        languagesKnown: appFieldToggleSchema.required(),
        locationsOpenTo: appFieldToggleSchema.required(),
      })
      .required(),
    customFields: yup
      .array()
      .of(customFieldItemSchema)
      .max(10, "You can add at most 10 custom fields")
      .required(),
    screeningQuestions: yup
      .array()
      .of(screeningItemSchema)
      .max(5, "You can add at most 5 screening questions")
      .required(),
  })
  .required()
  .test(
    "at-least-one-field",
    "Enable at least one standard field, or add a custom field or screening question.",
    (value) => {
      if (!value) return false;
      return hasAtLeastOneEnabledField(value as ApplicationFormState);
    },
  );

export type ApplicationFormSchemaValues = yup.InferType<typeof applicationFormSchema>;

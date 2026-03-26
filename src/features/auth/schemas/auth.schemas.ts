import * as yup from "yup";

/** Trim string; empty string becomes undefined for optional fields. */
function trimString(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

/** Letters (any script), spaces, hyphens, apostrophes, periods inside the name. */
const RE_PERSON_NAME = /^[\p{L}][\p{L}\s'.-]{0,118}$/u;

/** Company / org: letters, numbers, common punctuation (no < or >). */
const RE_COMPANY_NAME =
  /^[\p{L}\p{N}\s&.,()\-'\/+#]{2,200}$/u;

/** Job title: letters, numbers, common punctuation. */
const RE_JOB_TITLE =
  /^[\p{L}\p{N}\s&.,()\-'\/+#:;]{2,200}$/u;

/** Printable ASCII for passwords (matches typical bcrypt input; avoids invisible unicode). */
const RE_PASSWORD_PRINTABLE = /^[\x20-\x7E]+$/;

const emailField = yup
  .string()
  .required("Email is required")
  .transform(trimString)
  .min(5, "Email is too short")
  .max(320, "Email is too long (max 320 characters)")
  .email("Enter a valid email address")
  .matches(
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    "Enter a valid email with a domain (e.g. name@company.com)",
  );

/** Registration / reset: aligned with auth service (min 8); adds basic strength checks. */
const passwordFieldNew = yup
  .string()
  .required("Password is required")
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long (max 128 characters)")
  .matches(RE_PASSWORD_PRINTABLE, "Use only letters, numbers, and common symbols on your keyboard")
  .matches(/[a-zA-Z]/, "Include at least one letter")
  .matches(/[0-9]/, "Include at least one number");

/** Sign-in: service expects passwords ≥ 8 chars; upper bound avoids abuse. */
const passwordFieldSignIn = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(256, "Password is too long");

export const signInSchema = yup.object({
  email: emailField,
  password: passwordFieldSignIn,
});

export type SignInFormValues = yup.InferType<typeof signInSchema>;

const optionalRecruiterName = yup
  .string()
  .transform(trimString)
  .max(120, "Too long (max 120 characters)")
  .test(
    "name-optional",
    "Use only letters, spaces, hyphens, and apostrophes",
    (v) => v === undefined || v === "" || RE_PERSON_NAME.test(v),
  )
  .optional();

export const signUpSchema = yup.object({
  role: yup
    .string()
    .oneOf(["candidate", "recruiter"], "Select candidate or recruiter")
    .required("Select how you are signing up"),
  email: emailField,
  password: passwordFieldNew,
  firstName: yup.string().when("role", {
    is: "candidate",
    then: (schema) =>
      schema
        .required("First name is required")
        .transform(trimString)
        .min(1, "First name is required")
        .max(120, "First name is too long (max 120 characters)")
        .matches(
          RE_PERSON_NAME,
          "Use letters, spaces, hyphens, or apostrophes (max 120 characters)",
        ),
    otherwise: () => optionalRecruiterName,
  }),
  lastName: yup.string().when("role", {
    is: "candidate",
    then: (schema) =>
      schema
        .required("Last name is required")
        .transform(trimString)
        .min(1, "Last name is required")
        .max(120, "Last name is too long (max 120 characters)")
        .matches(
          RE_PERSON_NAME,
          "Use letters, spaces, hyphens, or apostrophes (max 120 characters)",
        ),
    otherwise: () => optionalRecruiterName,
  }),
  companyName: yup.string().when("role", {
    is: "recruiter",
    then: (schema) =>
      schema
        .required("Company name is required")
        .transform(trimString)
        .min(2, "Enter at least 2 characters")
        .max(200, "Company name is too long (max 200 characters)")
        .matches(
          RE_COMPANY_NAME,
          "Use letters, numbers, and common punctuation only (no < or >)",
        ),
    otherwise: (schema) => schema.optional(),
  }),
  recruiterTitle: yup.string().when("role", {
    is: "recruiter",
    then: (schema) =>
      schema
        .required("Your title is required")
        .transform(trimString)
        .min(2, "Enter at least 2 characters")
        .max(200, "Title is too long (max 200 characters)")
        .matches(
          RE_JOB_TITLE,
          "Use letters, numbers, and common punctuation only",
        ),
    otherwise: (schema) => schema.optional(),
  }),
  termsAccepted: yup
    .boolean()
    .required("Confirm the terms to continue")
    .oneOf([true], "You must accept the terms and privacy policy"),
});

/** Explicit shape so `react-hook-form` + `yupResolver` agree on optional role fields. */
export type SignUpFormValues = {
  role: "candidate" | "recruiter";
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  recruiterTitle?: string;
  termsAccepted: boolean;
};

/** 6-digit OTP (spaces/dashes stripped before check). */
const otpCodeField = yup
  .string()
  .required("Verification code is required")
  .transform((v) => (typeof v === "string" ? v.replace(/\D/g, "") : ""))
  .length(6, "Enter exactly 6 digits")
  .matches(/^\d{6}$/, "Code must be 6 numbers");

export const verifyEmailSchema = yup.object({
  email: emailField,
  code: otpCodeField,
});

export type VerifyEmailFormValues = yup.InferType<typeof verifyEmailSchema>;

export const forgotPasswordSchema = yup.object({
  email: emailField,
});

export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup.object({
  email: emailField,
  code: otpCodeField,
  password: passwordFieldNew,
});

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;

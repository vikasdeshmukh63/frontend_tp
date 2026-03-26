import type { LoginBody, RegisterBody } from "@/features/auth/api/auth-api";
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  SignInFormValues,
  SignUpFormValues,
  VerifyEmailFormValues,
} from "@/features/auth/schemas/auth.schemas";

const MAX_NAME_LEN = 200;

/** Trim, lowercase — safe for email fields. */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Remove null bytes only; do not trim (passwords may intentionally include spaces). */
export function sanitizePasswordInput(password: string): string {
  return password.replace(/\x00/g, "");
}

/** Trim, collapse internal whitespace, cap length — names, titles, company. */
export function sanitizePlainText(value: string | undefined, maxLen = MAX_NAME_LEN): string {
  if (value == null) return "";
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .slice(0, maxLen);
}

/** Digits only, max 6 (or longer codes if backend allows — cap at 32 per API). */
export function sanitizeOtpCode(code: string): string {
  return code.replace(/\D/g, "").slice(0, 32);
}

export function sanitizeLoginBody(values: SignInFormValues): LoginBody {
  return {
    email: sanitizeEmail(values.email),
    password: sanitizePasswordInput(values.password),
  };
}

export function sanitizeRegisterPayload(values: SignUpFormValues): RegisterBody {
  const email = sanitizeEmail(values.email);
  const password = sanitizePasswordInput(values.password);
  const role =
    values.role === "candidate" || values.role === "recruiter"
      ? values.role
      : "candidate";
  const base = { email, password, role };

  if (role === "candidate") {
    return {
      ...base,
      firstName: sanitizePlainText(values.firstName),
      lastName: sanitizePlainText(values.lastName),
    };
  }

  return {
    ...base,
    companyName: sanitizePlainText(values.companyName ?? ""),
    recruiterTitle: sanitizePlainText(values.recruiterTitle ?? ""),
    ...(values.firstName?.trim()
      ? { firstName: sanitizePlainText(values.firstName) }
      : {}),
    ...(values.lastName?.trim()
      ? { lastName: sanitizePlainText(values.lastName) }
      : {}),
  };
}

export function sanitizeVerifyEmailPayload(
  values: VerifyEmailFormValues,
): { email: string; code: string } {
  return {
    email: sanitizeEmail(values.email),
    code: sanitizeOtpCode(values.code),
  };
}

export function sanitizeForgotPasswordPayload(
  values: ForgotPasswordFormValues,
): { email: string } {
  return { email: sanitizeEmail(values.email) };
}

export function sanitizeResetPasswordPayload(
  values: ResetPasswordFormValues,
): { email: string; code: string; password: string } {
  return {
    email: sanitizeEmail(values.email),
    code: sanitizeOtpCode(values.code),
    password: sanitizePasswordInput(values.password),
  };
}

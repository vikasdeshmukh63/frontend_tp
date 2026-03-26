import { apiFetch } from "@/lib/api/client";
import type {
  AuthSuccessBody,
  MessageBody,
  ProfileBody,
  RegisterPendingBody,
} from "@/types/auth";

export type LoginBody = { email: string; password: string };

export type RegisterBody = {
  email: string;
  password: string;
  role: "candidate" | "recruiter";
  firstName?: string;
  lastName?: string;
  phone?: string;
  headline?: string;
  resumeUrl?: string;
  location?: string;
  yearsExperience?: number;
  companyName?: string;
  recruiterTitle?: string;
};

export function login(body: LoginBody) {
  return apiFetch<AuthSuccessBody>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function register(body: RegisterBody) {
  return apiFetch<RegisterPendingBody>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function verifyEmail(body: { email: string; code: string }) {
  return apiFetch<AuthSuccessBody>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function resendOtp(body: { email: string }) {
  return apiFetch<RegisterPendingBody>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function forgotPassword(body: { email: string }) {
  return apiFetch<MessageBody>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function resetPassword(body: {
  email: string;
  code: string;
  password: string;
}) {
  return apiFetch<MessageBody>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getMe(token: string) {
  return apiFetch<ProfileBody>("/api/users/me", {
    method: "GET",
    token,
  });
}

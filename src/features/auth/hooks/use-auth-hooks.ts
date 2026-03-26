"use client";

import {
  forgotPassword,
  getMe,
  login,
  register,
  resendOtp,
  resetPassword,
  verifyEmail,
} from "@/features/auth/api/auth-api";
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  SignInFormValues,
  SignUpFormValues,
  VerifyEmailFormValues,
} from "@/features/auth/schemas/auth.schemas";
import {
  sanitizeEmail,
  sanitizeForgotPasswordPayload,
  sanitizeLoginBody,
  sanitizeRegisterPayload,
  sanitizeResetPasswordPayload,
  sanitizeVerifyEmailPayload,
} from "@/features/auth/utils/sanitize-auth";
import { setSessionCookie } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMeQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { user } = await getMe(token!);
      return user;
    },
    enabled: !!token,
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SignInFormValues) =>
      login(sanitizeLoginBody(values)),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      setSessionCookie();
      queryClient.setQueryData(authKeys.me, data.user);
      router.push("/");
      router.refresh();
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (values: SignUpFormValues) =>
      register(sanitizeRegisterPayload(values)),
    onSuccess: (_data, variables: SignUpFormValues) => {
      router.push(
        `/verify-email?email=${encodeURIComponent(sanitizeEmail(variables.email))}`,
      );
      router.refresh();
    },
  });
}

export function useVerifyEmailMutation() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VerifyEmailFormValues) =>
      verifyEmail(sanitizeVerifyEmailPayload(values)),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      setSessionCookie();
      queryClient.setQueryData(authKeys.me, data.user);
      router.push("/");
      router.refresh();
    },
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      resendOtp({ email: sanitizeEmail(body.email) }),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      forgotPassword(sanitizeForgotPasswordPayload(values)),
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword(sanitizeResetPasswordPayload(values)),
    onSuccess: () => {
      router.push("/signin");
      router.refresh();
    },
  });
}

"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "@/features/auth/schemas/auth.schemas";
import {
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "@/features/auth/hooks/use-auth-hooks";
import { ApiError } from "@/lib/api/client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendOtpMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: yupResolver(verifyEmailSchema),
    defaultValues: { email: emailFromQuery, code: "" },
  });

  useEffect(() => {
    if (emailFromQuery) setValue("email", emailFromQuery);
  }, [emailFromQuery, setValue]);

  const onSubmit = (data: VerifyEmailFormValues) => {
    verifyMutation.mutate(data, {
      onError: (err) => {
        if (err instanceof ApiError) {
          setError("root", { message: err.message });
        } else {
          setError("root", { message: "Verification failed." });
        }
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto sm:pt-10">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code we sent to your email. If SMTP is not
            configured, check the auth server console for the code in
            development.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {errors.root && (
            <p className="text-sm text-error-500" role="alert">
              {errors.root.message}
            </p>
          )}
          <div>
            <Label>
              Email<span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              autoComplete="email"
              error={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>
              Verification code<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              error={!!errors.code}
              {...register("code")}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-error-500">{errors.code.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {verifyMutation.isPending ? "Verifying…" : "Verify and continue"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <button
            type="button"
            disabled={resendMutation.isPending}
            onClick={() => {
              const email = getValues("email").trim();
              if (!email) return;
              resendMutation.mutate(
                { email },
                {
                  onError: (err) => {
                    if (err instanceof ApiError) {
                      setError("root", { message: err.message });
                    }
                  },
                },
              );
            }}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50"
          >
            {resendMutation.isPending ? "Sending…" : "Resend code"}
          </button>
          <Link
            href="/signin"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

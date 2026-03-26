"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth.schemas";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth-hooks";
import { ApiError } from "@/lib/api/client";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordForm() {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const mutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setSentMessage(null);
    mutation.mutate(data, {
      onSuccess: (res) => {
        setSentMessage(res.message);
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setError("root", { message: err.message });
        } else {
          setError("root", { message: "Request failed." });
        }
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto sm:pt-10">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We&apos;ll email you a code to reset your password (verified accounts
            only).
          </p>
        </div>

        {sentMessage && (
          <p className="mb-4 rounded-lg border border-success-500/30 bg-success-500/10 p-3 text-sm text-gray-800 dark:text-gray-200">
            {sentMessage} Then use the code on{" "}
            <Link href="/reset-password" className="text-brand-500 underline">
              reset password
            </Link>
            .
          </p>
        )}

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
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {mutation.isPending ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <div className="mt-6">
          <Link
            href="/signin"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

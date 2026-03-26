"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth.schemas";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth-hooks";
import { ApiError } from "@/lib/api/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { email: "", code: "", password: "" },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutation.mutate(data, {
        onError: (err) => {
          if (err instanceof ApiError) {
            setError("root", { message: err.message });
          } else {
            setError("root", { message: "Reset failed." });
          }
        },
      });
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto sm:pt-10">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Reset password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the code from your email and choose a new password (min 8
            characters).
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
              Code<span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              error={!!errors.code}
              {...register("code")}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-error-500">{errors.code.message}</p>
            )}
          </div>
          <div>
            <Label>
              New password<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                error={!!errors.password}
                className="pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-error-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {mutation.isPending ? "Updating…" : "Reset password"}
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

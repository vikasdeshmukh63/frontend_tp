import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify email | ETIP",
  description: "Confirm your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-gray-500">
          Loading…
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

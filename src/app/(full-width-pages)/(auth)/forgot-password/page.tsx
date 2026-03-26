import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password | ETIP",
  description: "Request a password reset code",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

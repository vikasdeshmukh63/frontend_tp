import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password | ETIP",
  description: "Set a new password with your reset code",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

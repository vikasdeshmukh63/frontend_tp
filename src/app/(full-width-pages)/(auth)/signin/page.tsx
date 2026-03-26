import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | ETIP",
  description: "Sign in to your ETIP workspace",
};

export default function SignIn() {
  return <SignInForm />;
}

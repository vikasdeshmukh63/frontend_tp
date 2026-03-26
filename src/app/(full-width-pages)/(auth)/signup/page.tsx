import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ETIP",
  description: "Create your ETIP account",
};

export default function SignUp() {
  return <SignUpForm />;
}

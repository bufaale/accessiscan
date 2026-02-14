import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - ADA Scanner",
};

export default function SignupPage() {
  return <SignupForm />;
}

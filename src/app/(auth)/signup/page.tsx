import type { Metadata } from "next";
import AuthShell from "@/app/login-v2-preview/_shared";

export const metadata: Metadata = {
  title: "Sign Up - AccessiScan",
  description: "Create your AccessiScan account. Free tier ships 2 WCAG scans per month with no credit card required.",
};

export default function SignupPage() {
  return <AuthShell initialMode="signup" />;
}

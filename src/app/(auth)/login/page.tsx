import type { Metadata } from "next";
import AuthShell from "@/app/login-v2-preview/_shared";

export const metadata: Metadata = {
  title: "Sign In - AccessiScan",
  description: "Sign in to AccessiScan to run WCAG 2.1 AA scans, generate VPAT 2.5 exports, and open Auto-Fix PRs against your repo.",
};

export default function LoginPage() {
  return <AuthShell initialMode="login" />;
}

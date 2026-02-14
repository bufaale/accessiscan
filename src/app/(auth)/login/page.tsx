import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ADA Scanner",
};

export default function LoginPage() {
  return <LoginForm />;
}

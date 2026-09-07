"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuthButtons } from "./oauth-buttons";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Item 6 (2026-09-06 fix pass): the submit button used to be
    // `disabled={!acceptedTos}`, which is functionally a dead end — a
    // disabled <button> fires no click event at all (not a React handler
    // call that gets short-circuited), so unchecking the box produced no
    // request, no error, and no visible feedback. The only guard clause
    // users could ever see was the password-length one below. The button is
    // now always clickable while not loading; this is the first check, and
    // it's the one hard rule that matters here: a guard that blocks
    // submission must tell the user why.
    if (!acceptedTos) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // Without emailRedirectTo, Supabase redirects to site_url root
        // after email confirmation, which adds ?code=xxx that our root
        // page doesn't handle → user lands on /login?error=auth.
        // Route them through /auth/confirm which exchanges the code
        // properly and lands them on /dashboard.
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // With email confirmation disabled, Supabase silently logs in existing users.
    // Detect this by checking if the account was created more than 10 seconds ago.
    if (data.user) {
      const createdAt = new Date(data.user.created_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

      if (diffSeconds > 10) {
        await supabase.auth.signOut();
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Get started for free</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="rounded-md bg-primary/10 p-4 text-center text-sm text-primary">
            Check your email to confirm your account.
          </div>
        ) : (
          <>
            <OAuthButtons />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="tos"
                  checked={acceptedTos}
                  onChange={(e) => setAcceptedTos(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border border-input accent-primary"
                />
                <label
                  htmlFor="tos"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

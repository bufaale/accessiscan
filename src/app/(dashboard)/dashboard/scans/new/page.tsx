"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Loader2, Globe, CheckCircle, AlertCircle, ArrowRight, Lock, Zap } from "lucide-react";
import type { Scan } from "@/types/database";

const statusMessages: Record<Scan["status"], string> = {
  pending: "Waiting to start...",
  crawling: "Loading page and running accessibility checks...",
  analyzing: "Analyzing results and generating fixes...",
  completed: "Scan complete!",
  failed: "Scan failed",
};

const statusColors: Record<Scan["status"], string> = {
  pending: "bg-muted",
  crawling: "bg-blue-500",
  analyzing: "bg-purple-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

export default function NewScanPage() {
  return (
    <Suspense>
      <NewScanContent />
    </Suspense>
  );
}

function NewScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get("url") ?? "");
  const [scanType, setScanType] = useState<"quick" | "deep">("quick");
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<Scan["status"] | null>(null);
  const [progress, setProgress] = useState(0);
  const [canDeepScan, setCanDeepScan] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("free");

  // Fetch user's plan to determine if deep scan is available
  useEffect(() => {
    async function fetchPlan() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", user.id)
        .single();

      const plan = profile?.subscription_plan ?? "free";
      setSubscriptionPlan(plan);
      setCanDeepScan(plan !== "free");
    }
    fetchPlan();
  }, []);

  // Handle scan status updates (from Realtime or polling)
  const handleScanUpdate = useCallback((updated: { status: Scan["status"]; progress: number }) => {
    setStatus(updated.status);
    setProgress(updated.progress);

    if (updated.status === "completed") {
      toast.success("Scan complete!");
      setTimeout(() => router.push(`/dashboard/scans/${scanId}`), 1500);
    } else if (updated.status === "failed") {
      toast.error("Scan failed. Please try again.");
      setLoading(false);
    }
  }, [scanId, router]);

  // Subscribe to scan updates via Supabase Realtime
  useEffect(() => {
    if (!scanId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scans",
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          const updated = payload.new as { status: Scan["status"]; progress: number };
          handleScanUpdate(updated);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, handleScanUpdate]);

  // Polling fallback in case Realtime WebSocket fails
  useEffect(() => {
    if (!scanId || status === "completed" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status !== status || data.progress !== progress) {
          handleScanUpdate({ status: data.status, progress: data.progress });
        }
      } catch { /* ignore polling errors */ }
    }, 3000);

    return () => clearInterval(interval);
  }, [scanId, status, progress, handleScanUpdate]);

  const handleSubmit = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a URL");
      return;
    }

    // Auto-add https:// if missing
    let fullUrl = trimmed;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }

    try {
      new URL(fullUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setStatus("pending");
    setProgress(0);

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl, scan_type: scanType }),
      });

      if (res.status === 403) {
        const data = await res.json();
        toast.error(data.error || "Deep scans require a Pro plan. Please upgrade.");
        setLoading(false);
        setStatus(null);
        return;
      }

      if (res.status === 429) {
        const data = await res.json();
        toast.error(data.error || "Monthly scan limit reached. Upgrade your plan.");
        setLoading(false);
        setStatus(null);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to start scan");
        setLoading(false);
        setStatus(null);
        return;
      }

      const data = await res.json();
      setScanId(data.scanId);
      toast.success("Scan started! Monitoring progress...");
    } catch {
      toast.error("Failed to start scan. Please try again.");
      setLoading(false);
      setStatus(null);
    }
  }, [url, scanType]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">New Accessibility Scan</h1>
        <p className="text-muted-foreground">Check your website for WCAG 2.1 compliance issues</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website URL
          </CardTitle>
          <CardDescription>
            Enter the full URL of the page you want to scan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
              disabled={loading}
              className="flex-1"
            />
          </div>

          {/* Scan Type Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Scan Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScanType("quick")}
                disabled={loading}
                className={`relative flex flex-col items-start p-4 rounded-lg border-2 transition-all ${
                  scanType === "quick"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">Quick Scan</span>
                </div>
                <span className="text-xs text-muted-foreground">Single page analysis</span>
              </button>

              <button
                onClick={() => !loading && canDeepScan && setScanType("deep")}
                disabled={loading || !canDeepScan}
                className={`relative flex flex-col items-start p-4 rounded-lg border-2 transition-all ${
                  scanType === "deep"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${loading || !canDeepScan ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Search className="h-4 w-4" />
                  <span className="font-semibold">Deep Scan</span>
                  {!canDeepScan && <Badge variant="secondary" className="text-xs">Pro</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {canDeepScan ? "Up to 10 pages" : "Upgrade to unlock"}
                </span>
                {!canDeepScan && (
                  <Lock className="absolute top-2 right-2 h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !url.trim()} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {loading ? "Scanning..." : "Run Scan"}
          </Button>

          {/* Progress Section */}
          {status && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : status === "failed" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span className="text-sm font-medium">{statusMessages[status]}</span>
                </div>
                <Badge variant="secondary">{progress}%</Badge>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${statusColors[status]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Phase indicators */}
              {status !== "pending" && (
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {progress >= 30 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                    Loading page
                  </div>
                  <div className="flex items-center gap-1">
                    {progress >= 60 ? <CheckCircle className="h-3 w-3 text-green-500" /> : progress >= 30 ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-3 w-3" />}
                    Running accessibility tests
                  </div>
                  <div className="flex items-center gap-1">
                    {progress >= 90 ? <CheckCircle className="h-3 w-3 text-green-500" /> : progress >= 60 ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-3 w-3" />}
                    Analyzing results
                  </div>
                  <div className="flex items-center gap-1">
                    {progress >= 100 ? <CheckCircle className="h-3 w-3 text-green-500" /> : progress >= 90 ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-3 w-3" />}
                    Generating AI fixes
                  </div>
                </div>
              )}

              {status === "completed" && (
                <Button className="w-full" onClick={() => router.push(`/dashboard/scans/${scanId}`)}>
                  View Results <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      {!status && (
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">What we check</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Color contrast ratios</div>
              <div>• Keyboard navigation</div>
              <div>• Form labels and ARIA</div>
              <div>• Image alt text</div>
              <div>• Heading structure</div>
              <div>• Link text clarity</div>
              <div>• Document language</div>
              <div>• AI-powered fix suggestions</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

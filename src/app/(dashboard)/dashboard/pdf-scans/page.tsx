"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Upload,
  Loader2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface PdfScan {
  id: string;
  filename: string;
  file_size_bytes: number;
  page_count: number | null;
  status: "pending" | "running" | "completed" | "failed";
  score: number | null;
  is_tagged: boolean | null;
  has_language: boolean | null;
  declared_language: string | null;
  has_title: boolean | null;
  image_total_count: number;
  image_with_alt_count: number;
  form_field_total_count: number;
  form_field_with_label_count: number;
  error_message: string | null;
  created_at: string;
}

export default function PdfScansPage() {
  const [scans, setScans] = useState<PdfScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [gated, setGated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/pdf-scans");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScans(data.scans ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/pdf-scans", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) setGated(true);
        toast.error(data.error ?? "Upload failed");
        return;
      }
      toast.success(`Scored ${data.report.score}/100`);
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <FileText className="h-6 w-6" /> PDF accessibility scanning
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Upload a PDF — we analyse PDF/UA-1 + WCAG 2.1 AA + EN 301 549
          Clause 10 criteria: tagging, language declaration, title, alt text
          coverage, form field labels. Required for DOJ Title II and most EU
          public-sector procurement. Business / Agency plan feature.
        </p>
      </div>

      {gated && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <Lock className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                PDF accessibility scanning is on the Business and Agency plans
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/settings/billing">See plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <label className="flex items-center justify-center gap-3 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 cursor-pointer hover:border-slate-400">
            <Upload className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {uploading ? "Analysing..." : "Upload a PDF (max 25 MB)"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
            No PDF scans yet. Upload a PDF to run the first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {scans.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/pdf-scans/${s.id}`}
              className="rounded-md border bg-card p-5 transition-colors hover:border-slate-400"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <p className="truncate font-semibold">{s.filename}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{(s.file_size_bytes / 1024).toFixed(0)} KB</span>
                    {s.page_count !== null && <span>{s.page_count} pages</span>}
                    {s.declared_language && <span>lang: {s.declared_language}</span>}
                    <span>{new Date(s.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.is_tagged === true ? <Badge variant="outline" className="text-emerald-700 border-emerald-300"><CheckCircle2 className="mr-1 h-3 w-3" />Tagged</Badge> : s.is_tagged === false ? <Badge variant="outline" className="text-red-700 border-red-300"><XCircle className="mr-1 h-3 w-3" />Not tagged</Badge> : null}
                    {s.has_language === false && <Badge variant="outline" className="text-red-700 border-red-300"><AlertTriangle className="mr-1 h-3 w-3" />No lang</Badge>}
                    {s.has_title === false && <Badge variant="outline" className="text-red-700 border-red-300"><AlertTriangle className="mr-1 h-3 w-3" />No title</Badge>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {s.status === "completed" && s.score !== null ? (
                    <div>
                      <p className="font-display text-3xl font-bold text-[#0b1f3a]">{s.score}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">/ 100</p>
                    </div>
                  ) : s.status === "failed" ? (
                    <Badge variant="outline" className="text-red-700">failed</Badge>
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

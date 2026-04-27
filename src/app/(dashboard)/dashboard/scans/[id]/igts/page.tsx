"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

type Status = "pending" | "passed" | "failed" | "not_applicable";

interface IgtItem {
  template_id: string;
  wcag_criterion: string;
  wcag_level: "A" | "AA";
  wcag_version: "2.1" | "2.2";
  category: string;
  title: string;
  question: string;
  guidance: string[];
  pass_criteria: string;
  common_failures: string[];
  status: Status;
  auditor_notes: string;
  evidence_url: string;
  reviewed_at: string | null;
}

interface Summary {
  total: number;
  pending: number;
  passed: number;
  failed: number;
  not_applicable: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  keyboard: "Keyboard operation",
  screen_reader: "Screen reader announcements",
  content: "Content structure",
  visual: "Visual presentation",
  motion: "Motion & pointer",
  forms: "Forms & authentication",
};

const STATUS_ICON: Record<Status, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-slate-500" />,
  passed: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  failed: <XCircle className="h-4 w-4 text-red-600" />,
  not_applicable: <MinusCircle className="h-4 w-4 text-slate-500" />,
};

export default function ScanIgtsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: scanId } = use(params);
  const [items, setItems] = useState<IgtItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/scans/${scanId}/igts`);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.items);
    setSummary(data.summary);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [scanId]); // eslint-disable-line react-hooks/exhaustive-deps

  function update<K extends keyof IgtItem>(templateId: string, key: K, value: IgtItem[K]) {
    setItems((prev) =>
      prev.map((i) => (i.template_id === templateId ? { ...i, [key]: value } : i)),
    );
  }

  async function save(item: IgtItem) {
    setSaving(item.template_id);
    try {
      const res = await fetch(
        `/api/scans/${scanId}/igts/${item.template_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: item.status,
            auditor_notes: item.auditor_notes || undefined,
            evidence_url: item.evidence_url || undefined,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        toast.error(typeof err.error === "string" ? err.error : "Save failed");
        return;
      }
      toast.success("Saved");
      await load();
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tests
      </div>
    );
  }

  const grouped = items.reduce<Record<string, IgtItem[]>>((acc, i) => {
    (acc[i.category] ??= []).push(i);
    return acc;
  }, {});

  const progress = summary
    ? Math.round(
        ((summary.passed + summary.failed + summary.not_applicable) / summary.total) * 100,
      )
    : 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/scans/${scanId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to scan
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <ClipboardCheck className="h-6 w-6" /> Intelligent Guided Tests
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Automated scans catch ~30-40% of WCAG issues. These {items.length}
          {" "}guided tests cover the remaining criteria that need human
          judgment: keyboard operation, screen reader announcements, meaningful
          sequence, text spacing, sensory content, and WCAG 2.2 additions.
        </p>
      </div>

      {summary && (
        <Card>
          <CardContent className="grid gap-4 py-5 md:grid-cols-5">
            <Stat label="Progress" value={`${progress}%`} tone="primary" />
            <Stat label="Passed" value={summary.passed} tone="emerald" />
            <Stat label="Failed" value={summary.failed} tone="red" />
            <Stat label="Not applicable" value={summary.not_applicable} tone="slate" />
            <Stat label="Pending" value={summary.pending} tone="slate" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, tests]) => (
          <Card key={cat}>
            <CardContent className="pt-6">
              <h2 className="font-display text-lg font-semibold">{CATEGORY_LABEL[cat] ?? cat}</h2>
              <Accordion type="multiple" className="mt-2">
                {tests.map((item) => (
                  <AccordionItem key={item.template_id} value={item.template_id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {STATUS_ICON[item.status]}
                          <div className="min-w-0 text-left">
                            <p className="font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.question}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                          {item.wcag_criterion} · {item.wcag_level} · v{item.wcag_version}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            How to check
                          </p>
                          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                            {item.guidance.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ol>
                        </div>

                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                            Passes when
                          </p>
                          <p className="mt-1">{item.pass_criteria}</p>
                        </div>

                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
                            Common failures
                          </p>
                          <ul className="mt-1.5 list-disc space-y-1 pl-5">
                            {item.common_failures.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`status-${item.template_id}`}>Status</Label>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {(["pending", "passed", "failed", "not_applicable"] as Status[]).map((st) => (
                                <Button
                                  key={st}
                                  type="button"
                                  variant={item.status === st ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => update(item.template_id, "status", st)}
                                >
                                  {st.replace("_", " ")}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`evidence-${item.template_id}`}>Evidence URL (optional)</Label>
                            <Input
                              id={`evidence-${item.template_id}`}
                              value={item.evidence_url}
                              onChange={(e) => update(item.template_id, "evidence_url", e.target.value)}
                              placeholder="https://example.com/screenshot.png"
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${item.template_id}`}>Auditor notes</Label>
                          <Textarea
                            id={`notes-${item.template_id}`}
                            value={item.auditor_notes}
                            onChange={(e) => update(item.template_id, "auditor_notes", e.target.value)}
                            rows={3}
                            maxLength={2000}
                            placeholder="What did you observe? What assistive tech did you use?"
                            className="mt-1.5"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {item.reviewed_at && (
                            <span className="text-xs text-muted-foreground">
                              Last reviewed {new Date(item.reviewed_at).toLocaleString()}
                            </span>
                          )}
                          <Button
                            size="sm"
                            onClick={() => save(item)}
                            disabled={saving === item.template_id}
                          >
                            {saving === item.template_id ? (
                              <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving
                              </>
                            ) : (
                              "Save result"
                            )}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "primary" | "emerald" | "red" | "slate";
}) {
  const toneClass: Record<typeof tone, string> = {
    primary: "text-[#0b1f3a]",
    emerald: "text-emerald-700",
    red: "text-red-700",
    slate: "text-slate-700",
  };
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold tracking-tight ${toneClass[tone]}`}>
        {value}
      </p>
    </div>
  );
}

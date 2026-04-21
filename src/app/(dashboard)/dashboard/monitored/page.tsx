"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Activity,
  PlusCircle,
  Loader2,
  Trash2,
  TrendingDown,
  Globe,
  Lock,
} from "lucide-react";

interface MonitoredSite {
  id: string;
  url: string;
  label: string | null;
  cadence: "daily" | "weekly" | "monthly";
  enabled: boolean;
  last_scan_at: string | null;
  last_score: number | null;
  last_critical: number;
  last_serious: number;
  alert_email: string | null;
  regression_threshold: number;
  created_at: string;
}

export default function MonitoredSitesPage() {
  const [sites, setSites] = useState<MonitoredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);

  // Form
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [cadence, setCadence] = useState<MonitoredSite["cadence"]>("weekly");
  const [alertEmail, setAlertEmail] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/monitored");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSites(data.sites ?? []);
    } catch {
      toast.error("Failed to load monitored sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/monitored", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          label: label || undefined,
          cadence,
          alert_email: alertEmail || undefined,
          regression_threshold: threshold,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setGated(true);
          toast.error(data.error ?? "Business plan required");
        } else {
          toast.error(data.error ?? "Create failed");
        }
        return;
      }
      toast.success("Site added to monitoring");
      setUrl("");
      setLabel("");
      setAlertEmail("");
      await load();
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleEnabled(site: MonitoredSite) {
    await fetch(`/api/monitored/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !site.enabled }),
    });
    await load();
  }

  async function remove(site: MonitoredSite) {
    if (!confirm(`Stop monitoring ${site.label ?? site.url}?`)) return;
    await fetch(`/api/monitored/${site.id}`, { method: "DELETE" });
    toast.success("Removed");
    await load();
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
          <Activity className="h-6 w-6" /> Continuous monitoring
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Business tier feature. We re-scan each registered URL on your chosen
          cadence and email you when the compliance score drops or the critical
          issue count increases vs the last baseline. Up to 10 sites.
        </p>
      </div>

      {gated && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <Lock className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                Continuous monitoring is on the Business plan
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Upgrade to unlock weekly/daily re-scans, regression alerts via
                email, and up to 10 monitored properties.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/pricing">See Business plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add a site</CardTitle>
          <CardDescription>
            We&apos;ll take the first snapshot on the next cron tick. Regression
            alerts begin from the second snapshot onward.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/checkout"
                required
              />
            </div>
            <div>
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Marketing checkout"
                maxLength={80}
              />
            </div>
            <div>
              <Label htmlFor="cadence">Cadence</Label>
              <Select value={cadence} onValueChange={(v) => setCadence(v as MonitoredSite["cadence"])}>
                <SelectTrigger id="cadence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-email">Alert email (optional)</Label>
              <Input
                id="alert-email"
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Defaults to your account email"
              />
            </div>
            <div>
              <Label htmlFor="threshold">Regression threshold (score drop)</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                max={50}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding</>
                ) : (
                  <><PlusCircle className="mr-2 h-4 w-4" />Add to monitoring</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold">Your monitored sites ({sites.length}/10)</h2>
        {sites.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No sites monitored yet. Add one above to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-3">
            {sites.map((site) => (
              <Card key={site.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{site.label ?? site.url}</p>
                      <Badge variant={site.enabled ? "default" : "secondary"}>
                        {site.enabled ? "active" : "paused"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{site.cadence}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{site.url}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {site.last_scan_at ? (
                        <>
                          <span>
                            Last scan: {new Date(site.last_scan_at).toLocaleString()}
                          </span>
                          <span className="font-semibold">Score: {site.last_score ?? "—"}</span>
                          {site.last_critical > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="h-3 w-3" />
                              {site.last_critical} critical
                            </span>
                          )}
                        </>
                      ) : (
                        <span>Awaiting first scan on next cron tick…</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={site.enabled}
                      onCheckedChange={() => toggleEnabled(site)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => remove(site)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

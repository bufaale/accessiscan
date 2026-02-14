"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanSearch, Globe, ArrowRight, Clock } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import type { Scan, Site } from "@/types/database";

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sitesTracked: 0,
    totalScans: 0,
    avgScore: null as number | null,
    criticalIssues: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        // Fetch recent scans
        const res = await fetch("/api/scans?limit=5");
        if (res.ok) {
          const data = await res.json();
          setRecentScans(data.scans);
        }

        // Fetch sites
        const sitesRes = await fetch("/api/sites");
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json();
          setSites(sitesData.sites ?? []);
        }

        // Fetch stats
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch {
        // Silently fail - dashboard still renders
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getScoreColor(score: number | null) {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreBadgeVariant(score: number | null): "default" | "secondary" | "destructive" {
    if (score === null) return "secondary";
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed": return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "scanning": return <Badge variant="secondary" className="bg-blue-600 text-white">Scanning</Badge>;
      case "analyzing": return <Badge variant="secondary" className="bg-purple-600 text-white">Analyzing</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  function getScanTypeBadge(scanType: string) {
    return scanType === "deep" ? (
      <Badge variant="default">Deep</Badge>
    ) : (
      <Badge variant="secondary">Quick</Badge>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your websites' accessibility compliance</p>
        </div>
        <Button onClick={() => router.push("/dashboard/scans/new")}>
          <ScanSearch className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        sitesTracked={stats.sitesTracked}
        totalScans={stats.totalScans}
        avgScore={stats.avgScore}
        criticalIssues={stats.criticalIssues}
      />

      {/* Sites Grid */}
      {sites.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Your Sites</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Card key={site.id} className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => router.push(`/dashboard/sites/${site.domain}`)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{site.domain}</p>
                      <p className="text-sm text-muted-foreground">{site.scan_count} scans</p>
                    </div>
                    <Badge variant={getScoreBadgeVariant(site.latest_score)}>
                      {site.latest_score !== null ? site.latest_score : "—"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/scans")}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="h-16 animate-pulse bg-muted rounded" /></Card>
            ))}
          </div>
        ) : recentScans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ScanSearch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No scans yet</h3>
              <p className="text-muted-foreground mb-4">Run your first accessibility scan to get started</p>
              <Button onClick={() => router.push("/dashboard/scans/new")}>
                <ScanSearch className="mr-2 h-4 w-4" /> Run First Scan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <Card key={scan.id} className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => router.push(`/dashboard/scans/${scan.id}`)}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={getScoreBadgeVariant(scan.compliance_score)}>
                      {scan.compliance_score !== null ? scan.compliance_score : "—"}
                    </Badge>
                    <div>
                      <p className="font-medium">{scan.url}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getScanTypeBadge(scan.scan_type)}
                    {getStatusBadge(scan.status)}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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

"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Minus, Globe, Clock, ArrowRight } from "lucide-react";
import type { Scan } from "@/types/database";

function getScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

function getStatusBadge(status: Scan["status"]) {
  switch (status) {
    case "completed": return <Badge className="bg-green-600">Completed</Badge>;
    case "pending": return <Badge variant="secondary">Pending</Badge>;
    case "crawling": return <Badge className="bg-blue-600 text-white">Crawling</Badge>;
    case "analyzing": return <Badge className="bg-purple-600 text-white">Analyzing</Badge>;
    case "failed": return <Badge variant="destructive">Failed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function SiteDetailPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: encodedDomain } = use(params);
  const domain = decodeURIComponent(encodedDomain);
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ domain, limit: "50" });
        const res = await fetch(`/api/scans?${params}`);
        if (res.ok) {
          const data = await res.json();
          setScans(data.scans);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [domain]);

  // Calculate trend
  const completedScans = scans.filter((s) => s.status === "completed" && s.compliance_score !== null);
  const latestScore = completedScans[0]?.compliance_score ?? null;
  const previousScore = completedScans[1]?.compliance_score ?? null;

  let trend: "up" | "down" | "same" | null = null;
  if (latestScore !== null && previousScore !== null) {
    if (latestScore > previousScore) trend = "up";
    else if (latestScore < previousScore) trend = "down";
    else trend = "same";
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Globe className="h-8 w-8" />
              {domain}
            </h1>
            <p className="text-muted-foreground">{scans.length} total scans</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/scans/new?url=https://${domain}`)}>
          Run New Scan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(latestScore)}`}>
                {latestScore ?? "—"}
              </span>
              {trend && (
                <div className="flex items-center gap-1">
                  {trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
                  {trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
                  {trend === "same" && <Minus className="h-5 w-5 text-muted-foreground" />}
                  {previousScore !== null && (
                    <span className="text-sm text-muted-foreground">
                      {trend === "up" ? "+" : trend === "down" ? "" : ""}
                      {latestScore !== null ? (latestScore - previousScore).toFixed(0) : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{completedScans.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${getScoreColor(
              completedScans.length > 0
                ? Math.round(completedScans.reduce((sum, s) => sum + (s.compliance_score ?? 0), 0) / completedScans.length)
                : null
            )}`}>
              {completedScans.length > 0
                ? Math.round(completedScans.reduce((sum, s) => sum + (s.compliance_score ?? 0), 0) / completedScans.length)
                : "—"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart (simplified text-based for now) */}
      {completedScans.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {completedScans.slice(0, 10).reverse().map((scan, i) => {
                const score = scan.compliance_score ?? 0;
                const height = (score / 100) * 100;
                const color = score >= 80 ? "bg-green-600" : score >= 50 ? "bg-yellow-600" : "bg-red-600";
                return (
                  <div key={scan.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full ${color} rounded-t`} style={{ height: `${height}%` }} />
                    <span className="text-xs text-muted-foreground">{score}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan List */}
      <Card>
        <CardHeader>
          <CardTitle>All Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scans found for this site
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow
                    key={scan.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (scan.status === "completed") router.push(`/dashboard/scans/${scan.id}`);
                    }}
                  >
                    <TableCell>
                      <span className={`text-xl font-bold ${getScoreColor(scan.compliance_score)}`}>
                        {scan.compliance_score ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">
                      {scan.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant={scan.scan_type === "deep" ? "default" : "secondary"}>
                        {scan.scan_type === "deep" ? "Deep" : "Quick"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(scan.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {scan.status === "completed" && (
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

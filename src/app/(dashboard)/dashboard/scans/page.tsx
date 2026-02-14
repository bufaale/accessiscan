"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, ArrowRight, Clock, Zap } from "lucide-react";
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

export default function ScanHistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        if (search) params.set("domain", search);
        const res = await fetch(`/api/scans?${params}`);
        if (res.ok) {
          const data = await res.json();
          setScans(data.scans);
          setTotalPages(data.totalPages);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, search]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan History</h1>
          <p className="text-muted-foreground">View all your accessibility scans</p>
        </div>
        <Button onClick={() => router.push("/dashboard/scans/new")}>
          <Search className="mr-2 h-4 w-4" /> New Scan
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Filter by domain..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : scans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No scans found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "No scans match your search" : "Run your first accessibility scan to get started"}
            </p>
            <Button onClick={() => router.push("/dashboard/scans/new")}>
              <Search className="mr-2 h-4 w-4" /> Run First Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id} className="cursor-pointer" onClick={() => {
                    if (scan.status === "completed") router.push(`/dashboard/scans/${scan.id}`);
                  }}>
                    <TableCell>
                      <span className={`text-xl font-bold ${getScoreColor(scan.compliance_score)}`}>
                        {scan.compliance_score ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{scan.domain}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {scan.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant={scan.scan_type === "deep" ? "default" : "secondary"}>
                        {scan.scan_type === "deep" ? (
                          <>
                            <Zap className="h-3 w-3 mr-1" />
                            Deep
                          </>
                        ) : (
                          "Quick"
                        )}
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
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

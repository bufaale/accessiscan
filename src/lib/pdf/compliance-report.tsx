import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Scan, ScanIssue } from "@/types/database";

const colors = {
  primary: "#1a1a2e",
  critical: "#ef4444",
  serious: "#f97316",
  moderate: "#eab308",
  minor: "#3b82f6",
  levelA: "#22c55e",
  levelAA: "#3b82f6",
  levelAAA: "#a855f7",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  white: "#ffffff",
};

function scoreColor(score: number | null): string {
  if (score === null) return colors.gray;
  if (score >= 80) return colors.levelA;
  if (score >= 50) return colors.moderate;
  return colors.critical;
}

const severityLabels: Record<"critical" | "serious" | "moderate" | "minor", string> = {
  critical: "CRITICAL",
  serious: "SERIOUS",
  moderate: "MODERATE",
  minor: "MINOR",
};

const severityColors: Record<"critical" | "serious" | "moderate" | "minor", string> = {
  critical: colors.critical,
  serious: colors.serious,
  moderate: colors.moderate,
  minor: colors.minor,
};

const levelLabels: Record<"A" | "AA" | "AAA", string> = {
  A: "Level A",
  AA: "Level AA",
  AAA: "Level AAA",
};

const levelColors: Record<"A" | "AA" | "AAA", string> = {
  A: colors.levelA,
  AA: colors.levelAA,
  AAA: colors.levelAAA,
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: colors.primary },
  header: { marginBottom: 20, borderBottom: "2 solid #1a1a2e", paddingBottom: 15 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, color: colors.gray, marginTop: 4 },
  date: { fontSize: 9, color: colors.gray, marginTop: 2 },
  scanType: { fontSize: 9, color: colors.gray, marginTop: 2 },

  scoresRow: { flexDirection: "row", marginBottom: 20 },
  scoreBox: { flex: 1, borderRadius: 6, padding: 10, marginHorizontal: 4, alignItems: "center", backgroundColor: colors.lightGray },
  scoreValue: { fontSize: 26, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 7, color: colors.gray, marginTop: 4, textTransform: "uppercase" as const },

  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 10 },
  summaryBox: { backgroundColor: colors.lightGray, borderRadius: 6, padding: 12, marginBottom: 16 },
  summaryText: { fontSize: 10, lineHeight: 1.5, color: "#374151" },

  issueCard: { marginBottom: 8, paddingBottom: 8, borderBottom: "1 solid #e5e7eb" },
  issueHeader: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  severityBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, marginRight: 8 },
  severityText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: colors.white },
  issueTitle: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  issueDesc: { fontSize: 9, color: colors.gray, marginTop: 3, marginLeft: 0 },
  issueSnippet: { fontSize: 8, color: "#6b7280", marginTop: 3, marginLeft: 0, fontFamily: "Courier" },
  issueFix: { fontSize: 9, marginTop: 3, marginLeft: 0 },

  footer: { position: "absolute" as const, bottom: 30, left: 40, right: 40, fontSize: 8, color: colors.gray, flexDirection: "row", justifyContent: "space-between" },
});

export interface ReportBranding {
  agencyName?: string;
  accent?: string; // hex, applied to the title + header rule
}

export function CompliancePDFReport({
  scan,
  issues,
  branding,
}: {
  scan: Scan;
  issues: ScanIssue[];
  branding?: ReportBranding;
}) {
  const brandName = branding?.agencyName?.trim();
  const accent = /^#[0-9a-fA-F]{6}$/.test(branding?.accent ?? "") ? branding!.accent! : null;
  const scores = [
    { label: "Overall", value: scan.compliance_score },
    { label: "Level A", value: scan.level_a_score },
    { label: "Level AA", value: scan.level_aa_score },
    { label: "Level AAA", value: scan.level_aaa_score },
  ];

  const levels = ["A", "AA", "AAA"] as const;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={accent ? { ...s.header, borderBottom: `2 solid ${accent}` } : s.header}>
          {brandName ? (
            <Text style={{ fontSize: 9, color: colors.gray, marginBottom: 4, textTransform: "uppercase" as const }}>
              Prepared by {brandName}
            </Text>
          ) : null}
          <Text style={accent ? { ...s.title, color: accent } : s.title}>WCAG Compliance Report</Text>
          <Text style={s.subtitle}>{scan.domain}</Text>
          <Text style={s.date}>
            Scanned {new Date(scan.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <Text style={s.scanType}>
            Scan Type: {scan.scan_type === "quick" ? "Quick (Single Page)" : `Deep (${scan.pages_scanned} pages)`}
          </Text>
        </View>

        {/* Scores */}
        <View style={s.scoresRow}>
          {scores.map((sc) => (
            <View key={sc.label} style={s.scoreBox}>
              <Text style={[s.scoreValue, { color: scoreColor(sc.value) }]}>{sc.value ?? "—"}</Text>
              <Text style={s.scoreLabel}>{sc.label}</Text>
            </View>
          ))}
        </View>

        {/* Issue Summary */}
        <View style={s.summaryBox}>
          <Text style={s.summaryText}>
            {scan.critical_count} Critical  •  {scan.serious_count} Serious  •  {scan.moderate_count} Moderate  •  {scan.minor_count} Minor
          </Text>
        </View>

        {/* AI Summary */}
        {scan.ai_summary && (
          <View>
            <Text style={s.sectionTitle}>Executive Summary</Text>
            <View style={s.summaryBox}>
              <Text style={s.summaryText}>{scan.ai_summary}</Text>
            </View>
          </View>
        )}

        {/* Issues by WCAG Level */}
        {levels.map((level) => {
          const levelIssues = issues
            .filter((i) => i.wcag_level === level)
            .sort((a, b) => {
              const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            });

          if (levelIssues.length === 0) return null;

          return (
            <View key={level}>
              <Text style={s.sectionTitle}>
                {levelLabels[level]} Issues ({levelIssues.length})
              </Text>
              {levelIssues.map((issue) => (
                <View key={issue.id} style={s.issueCard} wrap={false}>
                  <View style={s.issueHeader}>
                    <View style={[s.severityBadge, { backgroundColor: severityColors[issue.severity] }]}>
                      <Text style={s.severityText}>{severityLabels[issue.severity]}</Text>
                    </View>
                    <Text style={s.issueTitle}>{issue.rule_id}</Text>
                  </View>
                  <Text style={s.issueDesc}>{issue.rule_description}</Text>
                  {issue.html_snippet && (
                    <Text style={s.issueSnippet}>
                      {issue.html_snippet.substring(0, 200)}{issue.html_snippet.length > 200 ? "..." : ""}
                    </Text>
                  )}
                  {issue.fix_suggestion && <Text style={s.issueFix}>Fix: {issue.fix_suggestion}</Text>}
                </View>
              ))}
            </View>
          );
        })}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>{brandName ? `Prepared by ${brandName}` : "Generated by AccessiScan — accessiscan.piposlab.com"}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Scan } from "@/types/database";
import { CONFORMANCE_LABEL, type CriterionResult } from "@/lib/vpat/conformance";

const colors = {
  primary: "#1a1a2e",
  supports: "#16a34a",
  partial: "#eab308",
  fails: "#dc2626",
  notApplicable: "#6b7280",
  notEvaluated: "#6b7280",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
};

const conformanceColor: Record<CriterionResult["conformance"], string> = {
  supports: colors.supports,
  "partially-supports": colors.partial,
  "does-not-support": colors.fails,
  "not-applicable": colors.notApplicable,
  "not-evaluated": colors.notEvaluated,
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9, color: colors.primary },

  coverTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  coverSubtitle: { fontSize: 13, color: colors.gray, marginBottom: 30 },
  coverBox: { backgroundColor: colors.lightGray, borderRadius: 6, padding: 16, marginBottom: 12 },
  coverLabel: { fontSize: 8, color: colors.gray, textTransform: "uppercase" as const, marginBottom: 2, letterSpacing: 0.5 },
  coverValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  section: { marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  paragraph: { fontSize: 9.5, lineHeight: 1.5, color: "#374151", marginBottom: 6 },

  tableHeader: { flexDirection: "row", backgroundColor: colors.primary, padding: 6 },
  tableHeaderCell: { color: colors.white, fontSize: 8.5, fontFamily: "Helvetica-Bold" },

  // alignItems:"flex-start" keeps the conformance badge pinned to the top of
  // the row regardless of how tall the remarks column gets — previously the
  // badge floated mid-row on long remarks and looked mis-aligned.
  tableRow: { flexDirection: "row", borderBottom: `1 solid ${colors.border}`, padding: 6, alignItems: "flex-start" },
  tableRowAlt: { flexDirection: "row", borderBottom: `1 solid ${colors.border}`, padding: 6, backgroundColor: "#fafafa", alignItems: "flex-start" },

  colCriterion: { width: "22%", paddingRight: 6 },
  colConformance: { width: "18%", paddingRight: 6 },
  colRemarks: { width: "60%" },

  criterionId: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  criterionTitle: { fontSize: 8.5, color: colors.gray, marginTop: 1 },

  conformanceBadge: { paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3, alignSelf: "flex-start" },
  conformanceText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: colors.white },

  remarksText: { fontSize: 8.5, color: "#374151", lineHeight: 1.4 },

  summaryRow: { flexDirection: "row", marginBottom: 16 },
  summaryBox: { flex: 1, padding: 10, marginHorizontal: 3, borderRadius: 5, backgroundColor: colors.lightGray, alignItems: "center" },
  summaryValue: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  summaryLabel: { fontSize: 7, color: colors.gray, marginTop: 2, textAlign: "center" as const, textTransform: "uppercase" as const },

  footer: { position: "absolute" as const, bottom: 30, left: 40, right: 40, fontSize: 7.5, color: colors.gray, flexDirection: "row", justifyContent: "space-between" },

  disclaimer: { fontSize: 8, color: colors.gray, fontStyle: "italic" as const, marginTop: 12, padding: 10, backgroundColor: "#fef9c3", borderRadius: 4 },
});

export type AccessibilityStandard = "vpat-2.5" | "en-301-549";

interface VpatProps {
  scan: Scan;
  results: CriterionResult[];
  summary: Record<CriterionResult["conformance"], number>;
  vendor: string;
  productName: string;
  productVersion: string;
  contactEmail: string;
  evaluationDate: string;
  /** Which framing to use on the cover page and applicable-standards section. */
  standard?: AccessibilityStandard;
}

function CriterionRow({ result, index }: { result: CriterionResult; index: number }) {
  return (
    <View style={index % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
      <View style={s.colCriterion}>
        <Text style={s.criterionId}>
          {result.criterion.id} ({result.criterion.level})
        </Text>
        <Text style={s.criterionTitle}>{result.criterion.title}</Text>
      </View>
      <View style={s.colConformance}>
        <View style={[s.conformanceBadge, { backgroundColor: conformanceColor[result.conformance] }]}>
          <Text style={s.conformanceText}>{CONFORMANCE_LABEL[result.conformance]}</Text>
        </View>
      </View>
      <View style={s.colRemarks}>
        <Text style={s.remarksText}>{result.remarks || "—"}</Text>
      </View>
    </View>
  );
}

export function VPATReport({
  scan,
  results,
  summary,
  vendor,
  productName,
  productVersion,
  contactEmail,
  evaluationDate,
  standard = "vpat-2.5",
}: VpatProps) {
  const levelA = results.filter((r) => r.criterion.level === "A");
  const levelAA = results.filter((r) => r.criterion.level === "AA");
  const isEn = standard === "en-301-549";
  const docTitle = isEn
    ? "EN 301 549 Conformance Report"
    : "Voluntary Product Accessibility Template";
  const docSubtitle = isEn
    ? "EN 301 549 v3.2.1 — WCAG 2.1 & 2.2 Level A and AA"
    : "VPAT® 2.5 — WCAG 2.1 Level A and AA Report";
  const reportFooter = isEn ? "AccessiScan — EN 301 549 Report" : "AccessiScan — Generated VPAT 2.5";

  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={s.page}>
        <Text style={s.coverTitle}>{docTitle}</Text>
        <Text style={s.coverSubtitle}>{docSubtitle}</Text>

        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Vendor</Text>
          <Text style={s.coverValue}>{vendor}</Text>
        </View>
        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Product Name</Text>
          <Text style={s.coverValue}>{productName}</Text>
        </View>
        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Product Version</Text>
          <Text style={s.coverValue}>{productVersion}</Text>
        </View>
        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Report Date</Text>
          <Text style={s.coverValue}>{evaluationDate}</Text>
        </View>
        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Contact</Text>
          <Text style={s.coverValue}>{contactEmail}</Text>
        </View>
        <View style={s.coverBox}>
          <Text style={s.coverLabel}>Evaluated URL</Text>
          <Text style={s.coverValue}>{scan.url}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Evaluation Methods Used</Text>
          <Text style={s.paragraph}>
            Automated testing was performed using AccessiScan (AI-powered axe-core
            engine + visual AI analysis). {scan.scan_type === "deep" ? `A deep crawl of ${scan.pages_scanned} pages was analyzed.` : "A single-page quick scan was analyzed."} WCAG 2.1 success criteria requiring content-dependent
            judgement (e.g., audio descriptions, meaningful sequence) are reported as "Not
            Evaluated" and require human review before distribution.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Applicable Standards</Text>
          {isEn ? (
            <Text style={s.paragraph}>
              • EN 301 549 v3.2.1 — Accessibility requirements for ICT products and services{"\n"}
              • Web Content Accessibility Guidelines (WCAG) 2.1 Level A and AA{"\n"}
              • Web Content Accessibility Guidelines (WCAG) 2.2 Level A and AA (new criteria){"\n"}
              • European Accessibility Act (Directive (EU) 2019/882) — enforceable since 28 June 2025
            </Text>
          ) : (
            <Text style={s.paragraph}>
              • Web Content Accessibility Guidelines (WCAG) 2.1 Level A{"\n"}
              • Web Content Accessibility Guidelines (WCAG) 2.1 Level AA{"\n"}
              • U.S. DOJ Title II rule (28 CFR Part 35) — compliance deadlines extended by
              the April 2026 Interim Final Rule: April 26, 2027 for public entities with
              50,000+ residents; April 26, 2028 for smaller entities.
            </Text>
          )}
        </View>

        <View style={s.disclaimer}>
          <Text>
            Disclaimer: This VPAT was generated from automated scan results. Automated
            testing typically catches 30-40% of WCAG issues. A complete VPAT requires
            manual testing by a qualified accessibility professional. AccessiScan does
            not warrant legal compliance.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>{reportFooter}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Summary + Level A table */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Conformance Summary</Text>
        <View style={s.summaryRow}>
          <View style={s.summaryBox}>
            <Text style={[s.summaryValue, { color: colors.supports }]}>{summary.supports}</Text>
            <Text style={s.summaryLabel}>Supports</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={[s.summaryValue, { color: colors.partial }]}>{summary["partially-supports"]}</Text>
            <Text style={s.summaryLabel}>Partial</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={[s.summaryValue, { color: colors.fails }]}>{summary["does-not-support"]}</Text>
            <Text style={s.summaryLabel}>Does Not Support</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={[s.summaryValue, { color: colors.notEvaluated }]}>{summary["not-evaluated"]}</Text>
            <Text style={s.summaryLabel}>Not Evaluated</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>WCAG 2.1 Level A Report</Text>
        <View style={s.tableHeader} fixed>
          <View style={s.colCriterion}><Text style={s.tableHeaderCell}>Criterion</Text></View>
          <View style={s.colConformance}><Text style={s.tableHeaderCell}>Conformance</Text></View>
          <View style={s.colRemarks}><Text style={s.tableHeaderCell}>Remarks and Explanations</Text></View>
        </View>
        {levelA.map((result, i) => (
          <CriterionRow key={result.criterion.id} result={result} index={i} />
        ))}

        <View style={s.footer} fixed>
          <Text>{reportFooter}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Level AA table */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>WCAG 2.1 Level AA Report</Text>
        <View style={s.tableHeader} fixed>
          <View style={s.colCriterion}><Text style={s.tableHeaderCell}>Criterion</Text></View>
          <View style={s.colConformance}><Text style={s.tableHeaderCell}>Conformance</Text></View>
          <View style={s.colRemarks}><Text style={s.tableHeaderCell}>Remarks and Explanations</Text></View>
        </View>
        {levelAA.map((result, i) => (
          <CriterionRow key={result.criterion.id} result={result} index={i} />
        ))}

        <View style={s.footer} fixed>
          <Text>{reportFooter}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

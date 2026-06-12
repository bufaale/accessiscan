import type { Metadata } from "next";
import { getBaselineFull } from "@/lib/audit/baseline-store";
import { buildEvidencePack } from "@/lib/audit/evidence-pack-content";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Legal Evidence Pack — AccessiScan",
  robots: { index: false, follow: false },
};

export default async function EvidencePackPage({
  params,
  searchParams,
}: {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { auditId } = await params;
  const { token } = await searchParams;
  const baseline = token ? await getBaselineFull(auditId, token) : null;

  const wrap: React.CSSProperties = {
    maxWidth: 760,
    margin: "32px auto",
    padding: "0 24px 64px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#0f172a",
    lineHeight: 1.6,
  };

  if (!baseline) {
    return (
      <main style={wrap}>
        <h1 style={{ fontSize: 22 }}>Evidence Pack link invalid or expired</h1>
        <p style={{ color: "#64748b" }}>
          This link needs the access token from your audit delivery email. Reply to that email if you need it re-sent.
        </p>
      </main>
    );
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://accessiscan.piposlab.com";
  const pack = buildEvidencePack(
    { url: baseline.targetUrl, scannedAtUtc: baseline.scannedAt, hash: baseline.violationsHash, verifyUrl: `${base}/verify/${auditId}` },
    baseline.issues,
  );

  return (
    <main style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }} className="no-print">
        <div>
          <div style={{ color: "#dc2626", fontWeight: 800, fontSize: 18 }}>AccessiScan</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Legal Evidence Pack</div>
        </div>
        <PrintButton />
      </div>
      <h1 style={{ fontSize: 26, margin: "16px 0 2px" }}>WCAG Accessibility Audit — Evidence Pack</h1>
      <p style={{ color: "#64748b", marginTop: 0 }}>{baseline.targetUrl}</p>
      {/* Reuses the gate-approved Evidence Pack content (verifiable record, 30/60/90 plan,
          accessibility statement, demand-letter template, scope disclaimer). */}
      <div dangerouslySetInnerHTML={{ __html: pack.html }} />
    </main>
  );
}

import type { Metadata } from "next";
import { RescanClient } from "./rescan-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Re-scan & compare — AccessiScan",
  robots: { index: false, follow: false },
};

export default async function RescanPage({
  params,
  searchParams,
}: {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { auditId } = await params;
  const { token } = await searchParams;

  const wrap: React.CSSProperties = {
    maxWidth: 720,
    margin: "40px auto",
    padding: "0 24px 64px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#0f172a",
    lineHeight: 1.6,
  };

  if (!token) {
    return (
      <main style={wrap}>
        <h1 style={{ fontSize: 22 }}>Re-scan link needs your token</h1>
        <p style={{ color: "#64748b" }}>
          Use the re-scan link from your audit delivery email (it carries your access token), or reply to that email and we&apos;ll re-send it.
        </p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ color: "#dc2626", fontWeight: 800, fontSize: 18 }}>AccessiScan</div>
      <h1 style={{ fontSize: 26, margin: "8px 0 4px" }}>Re-scan &amp; compare</h1>
      <p style={{ color: "#64748b", marginTop: 0, marginBottom: 20 }}>
        After you remediate, run a fresh scan to document your progress against your dated baseline — the
        before/after record your attorney can submit to show remediation.
      </p>
      <RescanClient auditId={auditId} token={token} />
    </main>
  );
}

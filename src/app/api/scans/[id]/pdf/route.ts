import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CompliancePDFReport } from "@/lib/pdf/compliance-report";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  const { data: issues } = await supabase
    .from("scan_issues")
    .select("*")
    .eq("scan_id", id)
    .order("position", { ascending: true });

  // White-label: apply the agency's branding if they've set it (only Agency-tier
  // users can save branding — gated at the /api/settings/branding endpoint).
  const { data: profile } = await supabase
    .from("profiles")
    .select("branding")
    .eq("id", user.id)
    .single();
  const branding = (profile?.branding ?? undefined) as
    | { agencyName?: string; accent?: string }
    | undefined;

  const buffer = await renderToBuffer(
    CompliancePDFReport({ scan, issues: issues ?? [], branding }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="wcag-report-${scan.domain}-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}

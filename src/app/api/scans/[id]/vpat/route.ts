import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { VPATReport, type AccessibilityStandard } from "@/lib/pdf/vpat-report";
import { computeConformance, summarizeConformance } from "@/lib/vpat/conformance";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // VPAT is a premium feature (government / agency buyers).
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_plan === "free") {
    return NextResponse.json(
      { error: "VPAT generation requires a Pro or Agency subscription." },
      { status: 403 },
    );
  }

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

  const results = computeConformance(scan, issues ?? []);
  const summary = summarizeConformance(results);

  const vendor = (profile.full_name || "").trim() || "Your Organization";
  const contactEmail = (profile.email || "").trim() || user.email || "—";
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { searchParams } = new URL(req.url);
  const productName = (searchParams.get("product") || "").trim() || scan.domain;
  const productVersion = (searchParams.get("version") || "").trim() || "1.0";
  const standardParam = (searchParams.get("standard") || "").trim().toLowerCase();
  const standard: AccessibilityStandard =
    standardParam === "en-301-549" || standardParam === "en301549"
      ? "en-301-549"
      : "vpat-2.5";

  const buffer = await renderToBuffer(
    VPATReport({
      scan,
      results,
      summary,
      vendor,
      productName,
      productVersion,
      contactEmail,
      evaluationDate: reportDate,
      standard,
    }),
  );

  const filePrefix = standard === "en-301-549" ? "en-301-549" : "vpat-2.5";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filePrefix}-${scan.domain}-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}

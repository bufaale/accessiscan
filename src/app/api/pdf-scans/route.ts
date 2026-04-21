import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzePdfBuffer } from "@/lib/pdf-accessibility/analyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("pdf_scans")
    .select("id, filename, file_size_bytes, page_count, status, score, is_tagged, has_language, declared_language, has_title, image_total_count, image_with_alt_count, form_field_total_count, form_field_with_label_count, error_message, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ scans: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Plan gate: PDF scanning is a Business+ feature (gov/edu audience).
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();
  const plan = (profile?.subscription_plan ?? "free").toLowerCase();
  if (plan !== "business" && plan !== "agency") {
    return NextResponse.json(
      { error: "PDF accessibility scanning requires the Agency or Business plan." },
      { status: 402 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' in form data" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only .pdf files supported" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic-byte check. A well-formed PDF starts with "%PDF-" (0x25 0x50 0x44
  // 0x46 0x2D). Extension + browser-supplied MIME type are untrustworthy.
  if (
    buffer.length < 5 ||
    buffer[0] !== 0x25 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x44 ||
    buffer[3] !== 0x46 ||
    buffer[4] !== 0x2d
  ) {
    return NextResponse.json(
      { error: "Uploaded file is not a valid PDF (missing %PDF- signature)" },
      { status: 415 },
    );
  }

  const admin = createAdminClient();
  const { data: pending, error: insertErr } = await admin
    .from("pdf_scans")
    .insert({
      user_id: user.id,
      filename: file.name,
      file_size_bytes: file.size,
      status: "running",
    })
    .select()
    .single();
  if (insertErr || !pending) {
    return NextResponse.json({ error: insertErr?.message ?? "Create failed" }, { status: 500 });
  }

  try {
    const report = await analyzePdfBuffer(buffer);

    await admin.from("pdf_scans").update({
      status: "completed",
      score: report.score,
      page_count: report.pageCount,
      is_tagged: report.isTagged,
      has_language: report.hasLanguage,
      declared_language: report.declaredLanguage,
      has_title: report.hasTitle,
      has_marked_flag: report.hasMarkedFlag,
      image_total_count: report.imageTotalCount,
      image_with_alt_count: report.imageWithAltCount,
      form_field_total_count: report.formFieldTotalCount,
      form_field_with_label_count: report.formFieldWithLabelCount,
      completed_at: new Date().toISOString(),
    }).eq("id", pending.id);

    if (report.issues.length > 0) {
      await admin.from("pdf_scan_issues").insert(
        report.issues.map((i) => ({
          pdf_scan_id: pending.id,
          criterion: i.criterion,
          wcag_criterion: i.wcagCriterion ?? null,
          severity: i.severity,
          description: i.description,
          remediation: i.remediation,
          page_number: i.pageNumber ?? null,
        })),
      );
    }

    return NextResponse.json({ scan_id: pending.id, report });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    await admin
      .from("pdf_scans")
      .update({ status: "failed", error_message: message })
      .eq("id", pending.id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

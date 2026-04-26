import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkScanLimit } from "@/lib/usage";
import { urlInputSchema, validateResolvedIP } from "@/lib/security/url-validator";
import { logAuditEvent, extractAuditContext } from "@/lib/audit/log";
import { z } from "zod";

const createScanSchema = z.object({
  url: urlInputSchema,
  scan_type: z.enum(["quick", "deep"]).default("quick"),
});

// POST: Create a new scan
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const validation = createScanSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  const { url, scan_type } = validation.data;

  // URL already passed urlInputSchema (protocol + blocked hostnames + private IPs
  // for literal-IP inputs). Now do the DNS-resolution check to block DNS
  // rebinding + privately-routed domains.
  const parsedUrl = new URL(url);
  const dnsOk = await validateResolvedIP(parsedUrl.hostname);
  if (!dnsOk) {
    return NextResponse.json(
      { error: "URL could not be resolved or points to a private network" },
      { status: 400 },
    );
  }

  // Get user profile for subscription plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const subscriptionPlan = profile?.subscription_plan ?? "free";

  // Check usage limits
  const usage = await checkScanLimit(user.id, subscriptionPlan, scan_type);

  // Check if deep scan is allowed
  if (scan_type === "deep" && !usage.canDeepScan) {
    return NextResponse.json({
      error: "Deep scans are not available on your current plan. Upgrade to Pro to unlock deep scans.",
      usage,
    }, { status: 403 });
  }

  if (!usage.allowed) {
    return NextResponse.json({
      error: "Monthly scan limit reached. Upgrade your plan for more scans.",
      usage,
    }, { status: 429 });
  }

  const domain = parsedUrl.hostname;

  // Find or create site
  let { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .eq("domain", domain)
    .single();

  if (!site) {
    const { data: newSite } = await supabase
      .from("sites")
      .insert({ user_id: user.id, domain, name: domain })
      .select("id")
      .single();
    site = newSite;
  }

  // Create scan record (worker will pick it up)
  const { data: scan, error } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      site_id: site?.id,
      url: parsedUrl.toString(),
      domain,
      scan_type,
      status: "pending",
      progress: 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create scan" }, { status: 500 });
  }

  void logAuditEvent({
    userId: user.id,
    eventType: "scan.created",
    resource: `scan:${scan.id}`,
    summary: `Created ${scan_type} scan for ${parsedUrl.toString()}`,
    meta: { scan_id: scan.id, url: parsedUrl.toString(), scan_type, domain },
    ...extractAuditContext(req.headers),
  });

  return NextResponse.json({ scanId: scan.id, usage: { used: usage.used + 1, limit: usage.limit } });
}

// GET: List user's scans
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10),
    50,
  );
  const offset = (page - 1) * limit;
  const domain = searchParams.get("domain");

  let query = supabase
    .from("scans")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data: scans, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
  }

  return NextResponse.json({
    scans: scans ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { urlInputSchema } from "@/lib/security/url-validator";

const createSchema = z.object({
  url: urlInputSchema,
  label: z.string().trim().min(1).max(80).optional(),
  cadence: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  alert_email: z.string().email().optional().or(z.literal("")),
  regression_threshold: z.number().int().min(1).max(50).default(5),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("monitored_sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sites: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Gate: only business+ tier can add monitored sites
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, email")
    .eq("id", user.id)
    .single();
  const plan = (profile?.subscription_plan ?? "free").toLowerCase();
  if (plan !== "business") {
    return NextResponse.json(
      { error: "Continuous monitoring requires the Business plan." },
      { status: 402 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // Business tier cap: 10 monitored sites (matches landing promise)
  const { count } = await supabase
    .from("monitored_sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { error: "Business plan limit is 10 monitored sites. Remove one first." },
      { status: 402 },
    );
  }

  const alertEmail = parsed.data.alert_email || profile?.email || user.email;

  const { data, error } = await supabase
    .from("monitored_sites")
    .insert({
      user_id: user.id,
      url: parsed.data.url,
      label: parsed.data.label ?? new URL(parsed.data.url).hostname,
      cadence: parsed.data.cadence,
      alert_email: alertEmail,
      regression_threshold: parsed.data.regression_threshold,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You are already monitoring this URL." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ site: data });
}

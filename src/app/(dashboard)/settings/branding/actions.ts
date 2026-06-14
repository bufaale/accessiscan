"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// White-label is an Agency-and-above feature.
const AGENCY_PLANS = new Set(["agency", "business", "team"]);

const brandingSchema = z.object({
  agencyName: z.string().trim().max(80).optional().or(z.literal("")),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #0e7490")
    .optional()
    .or(z.literal("")),
});

export type BrandingResult = { ok: true } | { ok: false; error: string };

/**
 * Save the agency's white-label branding (agency name + accent color) used on
 * generated WCAG report PDFs. Gated to Agency-and-above plans. Same
 * authenticate-then-admin-write pattern as updateProfileDetails.
 */
export async function updateBranding(
  input: z.infer<typeof brandingSchema>,
): Promise<BrandingResult> {
  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("subscription_plan, subscription_status")
    .eq("id", user.id)
    .single();
  const plan = (prof?.subscription_plan ?? "").toLowerCase();
  if (!AGENCY_PLANS.has(plan)) {
    return {
      ok: false,
      error: "White-label branding is an Agency-plan feature. Upgrade to enable it.",
    };
  }

  const branding = {
    agencyName: parsed.data.agencyName?.trim() || null,
    accent: parsed.data.accent?.trim() || null,
  };

  const { error } = await admin.from("profiles").update({ branding }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/settings/branding");
  return { ok: true };
}

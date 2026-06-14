import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandingForm } from "./branding-form";

export const metadata = {
  title: "White-label branding - AccessiScan",
  description: "Put your agency's name and color on the WCAG reports you deliver to clients.",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const NAVY = "#0b1f3a";
const SLATE_500 = "#64748b";

const AGENCY_PLANS = new Set(["agency", "business", "team"]);

export default async function BrandingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, branding")
    .eq("id", user.id)
    .single();

  const plan = ((profile?.subscription_plan as string) ?? "free").toLowerCase();
  const isAgency = AGENCY_PLANS.has(plan);
  const branding = (profile?.branding ?? {}) as { agencyName?: string | null; accent?: string | null };

  return (
    <div style={{ padding: "24px 28px 48px", maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: NAVY }}>
          White-label branding
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: SLATE_500, maxWidth: 640, lineHeight: 1.55, fontFamily: FONT_INTER }}>
          Put your agency&apos;s name and accent color on the WCAG report PDFs you generate, so you
          can deliver them to clients as your own. Applies to every report you download.
        </p>
      </div>

      <BrandingForm
        isAgency={isAgency}
        initial={{
          agencyName: (branding.agencyName as string) ?? "",
          accent: (branding.accent as string) ?? "",
        }}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApiKeysClient } from "./api-keys-client";

export const metadata = {
  title: "API Keys - AccessiScan",
  description: "Generate and revoke API keys to call the AccessiScan scan API from CI pipelines, GitHub Actions, or third-party tools.",
};

const FONT_DISPLAY = "var(--font-display), sans-serif";
const FONT_INTER = "var(--font-inter), sans-serif";
const NAVY = "#0b1f3a";
const SLATE_500 = "#64748b";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/api-keys");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const isBusinessTier = (profile?.subscription_plan ?? "free").toLowerCase() === "business";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "32px 0", fontFamily: FONT_INTER }}>
      <div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: NAVY, margin: 0 }}>
          API Keys
        </h1>
        <p style={{ fontSize: 14, color: SLATE_500, margin: "8px 0 0", maxWidth: 640 }}>
          Generate API keys to run AccessiScan from CI pipelines, GitHub Actions, or your own tools. Keys are shown <strong>once</strong> on creation — copy them somewhere safe. You can revoke a key at any time without affecting other keys.
        </p>
      </div>

      <ApiKeysClient isBusinessTier={isBusinessTier} />
    </div>
  );
}

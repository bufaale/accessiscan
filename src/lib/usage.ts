import { createClient } from "@/lib/supabase/server";
import { pricingPlans } from "@/lib/stripe/plans";

export async function getMonthlyScanCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("scans")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  return count ?? 0;
}

export async function checkScanLimit(
  userId: string,
  subscriptionPlan: string,
  scanType: "quick" | "deep" = "quick",
): Promise<{ allowed: boolean; used: number; limit: number; canDeepScan: boolean }> {
  const plan = pricingPlans.find((p) => p.id === subscriptionPlan) ?? pricingPlans[0];
  const limit = plan.limits.scansPerMonth;
  const canDeepScan = plan.limits.canDeepScan;
  const used = await getMonthlyScanCount(userId);

  // Check if deep scan is allowed
  if (scanType === "deep" && !canDeepScan) {
    return { allowed: false, used, limit, canDeepScan };
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, used, limit: -1, canDeepScan };
  }

  return { allowed: used < limit, used, limit, canDeepScan };
}

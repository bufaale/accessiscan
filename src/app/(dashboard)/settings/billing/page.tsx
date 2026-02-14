import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButtons } from "./upgrade-buttons";
import { ManageSubscriptionButton } from "./manage-subscription-button";
import type { Profile } from "@/types/database";

export const metadata = {
  title: "Billing - ADA Scanner",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isActive = profile?.subscription_status === "active";

  // Capitalize plan name
  const planName = profile?.subscription_plan
    ? profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)
    : "Free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {isActive ? planName : "Free"}
            </span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "active" : profile?.subscription_status || "free"}
            </Badge>
          </div>
          {isActive ? (
            <ManageSubscriptionButton />
          ) : (
            <div className="space-y-3">
              <UpgradeButtons />
              {profile?.stripe_customer_id && (
                <ManageSubscriptionButton label="View Billing History" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

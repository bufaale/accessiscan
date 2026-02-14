"use client";

import { Button } from "@/components/ui/button";

export function ManageSubscriptionButton({ label = "Manage Subscription" }: { label?: string }) {
  return (
    <form action="/api/stripe/portal" method="POST">
      <Button type="submit" variant={label === "Manage Subscription" ? "default" : "outline"}>
        {label}
      </Button>
    </form>
  );
}

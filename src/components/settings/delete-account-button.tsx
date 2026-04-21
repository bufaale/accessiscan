"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * GDPR Art. 17 / CCPA right-to-erasure button. Requires the user to type
 * the exact confirmation phrase before calling the delete endpoint.
 */
export function DeleteAccountButton() {
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const EXPECTED = "DELETE MY ACCOUNT";

  async function handleDelete() {
    if (confirmation !== EXPECTED) return;
    if (!confirm("Final warning: deleting your account is permanent. All scans, VPATs, and settings will be erased.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: EXPECTED }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Delete failed");
        return;
      }
      toast.success("Account deleted");
      window.location.href = "/";
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-5">
      <div>
        <h3 className="font-display text-sm font-semibold text-red-900">
          Delete account
        </h3>
        <p className="mt-1 text-xs text-red-800">
          Under GDPR Article 17 / CCPA, you can request permanent deletion of
          your account and all associated data (scans, VPATs, sites, monitored
          sites, tracker integrations). Active Stripe subscriptions are
          cancelled first. This cannot be undone.
        </p>
      </div>
      <div>
        <Label htmlFor="confirm" className="text-xs text-red-900">
          Type <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">DELETE MY ACCOUNT</code> to confirm
        </Label>
        <Input
          id="confirm"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="mt-1.5 bg-white"
          autoComplete="off"
        />
      </div>
      <Button
        variant="destructive"
        size="sm"
        disabled={confirmation !== EXPECTED || deleting}
        onClick={handleDelete}
      >
        {deleting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting</>
        ) : (
          <><Trash2 className="mr-2 h-4 w-4" />Permanently delete my account</>
        )}
      </Button>
    </div>
  );
}

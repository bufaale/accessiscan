"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
}

/**
 * Inline error card for dashboard data-load failures. Replaces the
 * pre-existing pattern of `catch {}` + infinite skeleton, so users see
 * something went wrong and can retry without a full reload.
 */
export function DashboardError({ message, onRetry, retrying }: DashboardErrorProps) {
  return (
    <Card data-testid="dashboard-error">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle className="h-5 w-5 text-rose-700" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Failed to load dashboard data</p>
          {message && (
            <p className="mt-1 text-xs text-muted-foreground">{message}</p>
          )}
        </div>
        <Button
          onClick={onRetry}
          disabled={retrying}
          size="sm"
          variant="outline"
          data-testid="dashboard-error-retry"
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Retrying…" : "Retry"}
        </Button>
      </CardContent>
    </Card>
  );
}

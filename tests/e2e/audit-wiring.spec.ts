import { test, expect } from "@playwright/test";

/**
 * Audit log wiring — verifies the AccessiScan write paths CALL logAuditEvent
 * at the correct points. Source-level checks because runtime audit log
 * inserts require a full Supabase connection in CI.
 */

test.describe("Audit log wired into AccessiScan write paths", () => {
  test("scan creation logs scan.created event", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/api/scans/route.ts");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain('eventType: "scan.created"');
    expect(src).toContain("logAuditEvent");
    expect(src).toContain("extractAuditContext(req.headers)");
  });

  test("auto-fix endpoint logs auto_fix.pr_opened event", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/api/github-action/auto-fix/route.ts");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain('eventType: "auto_fix.pr_opened"');
    expect(src).toContain("logAuditEvent");
  });

  test("Stripe webhook logs subscription.created on checkout completed", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/api/stripe/webhook/route.ts");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain('eventType: "subscription.created"');
    expect(src).toContain('actorType: "webhook"');
    expect(src).toContain('actorId: "stripe"');
  });

  test("Stripe webhook logs subscription.canceled on subscription.deleted", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(process.cwd(), "src/app/api/stripe/webhook/route.ts");
    const src = await fs.readFile(file, "utf8");
    expect(src).toContain('eventType: "subscription.canceled"');
  });
});

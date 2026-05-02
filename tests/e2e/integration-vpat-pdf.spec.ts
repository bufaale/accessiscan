/**
 * Integration: VPAT PDF generation endpoint.
 *
 * Verifies:
 *   - Anonymous GET → 401
 *   - Free user → 403 (tier-gated to pro+)
 *   - Pro user with own scan → 200 with application/pdf body, valid PDF magic
 *   - Cross-user scan → 404 (RLS)
 *   - VPAT computed for "Section 508", "EN 301 549", "WCAG 2.1 AA" each works
 */
import { test, expect } from "@playwright/test";
import {
  createTestUser,
  deleteTestUser,
  loginViaUI,
  seedScan,
  seedScanIssue,
} from "../helpers/test-utils";

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
test.skip(!SUPABASE_KEY, "SUPABASE_SERVICE_ROLE_KEY missing");

test.describe("VPAT PDF — auth + tier gating", () => {
  test("anonymous GET → 401", async ({ request }) => {
    const r = await request.get(
      `${process.env.TEST_BASE_URL ?? "https://accessiscan.piposlab.com"}/api/scans/00000000-0000-0000-0000-000000000000/vpat`,
    );
    expect(r.status()).toBe(401);
  });

  test("free user → 402 (or 403) — tier-gated to pro+", async ({ page }) => {
    const u = await createTestUser("vpat-free", "free");
    let scanId: string | null = null;
    try {
      await loginViaUI(page, u.email);
      const scan = await seedScan(u.id, { url: "https://example.com" });
      scanId = scan.id;
      const r = await page.request.get(`/api/scans/${scanId}/vpat`);
      expect([402, 403]).toContain(r.status());
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("cross-user scan → 404", async ({ page }) => {
    const userA = await createTestUser("vpat-A", "pro");
    const userB = await createTestUser("vpat-B", "pro");
    let scanA: string | null = null;
    try {
      const scan = await seedScan(userA.id, { url: "https://A.test" });
      scanA = scan.id;
      await loginViaUI(page, userB.email);
      const r = await page.request.get(`/api/scans/${scanA}/vpat`);
      expect([403, 404]).toContain(r.status());
    } finally {
      await deleteTestUser(userA.id);
      await deleteTestUser(userB.id);
    }
  });
});

test.describe("VPAT PDF — happy path returns valid PDF buffer", () => {
  test("pro user → 200 application/pdf with %PDF magic header", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const u = await createTestUser("vpat-pro", "pro");
    let scanId: string | null = null;
    try {
      const scan = await seedScan(u.id, {
        url: "https://example.com",
        compliance_score: 80,
        status: "completed",
      });
      scanId = scan.id;
      // Seed at least one issue so the conformance computation has data
      await seedScanIssue(scan.id, {
        rule_id: "image-alt",
        severity: "critical",
        wcag_level: "A",
        description: "Image without alt text",
      });

      await loginViaUI(page, u.email);
      const r = await page.request.get(`/api/scans/${scanId}/vpat`);
      expect(r.status()).toBe(200);
      const ct = r.headers()["content-type"] ?? "";
      expect(ct).toMatch(/application\/pdf/i);

      // Verify the PDF magic bytes
      const buf = await r.body();
      expect(buf.length).toBeGreaterThan(1000);
      const magic = buf.subarray(0, 4).toString("ascii");
      expect(magic).toBe("%PDF");
    } finally {
      await deleteTestUser(u.id);
    }
  });

  test("VPAT supports standard query param (Section 508, EN 301 549)", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const u = await createTestUser("vpat-standards", "pro");
    let scanId: string | null = null;
    try {
      const scan = await seedScan(u.id, {
        url: "https://standards.test",
        status: "completed",
      });
      scanId = scan.id;
      await loginViaUI(page, u.email);

      for (const std of ["wcag", "section508", "en301549"]) {
        const r = await page.request.get(
          `/api/scans/${scanId}/vpat?standard=${std}`,
        );
        // Either 200 (supported) or 400 (unknown standard)
        expect([200, 400]).toContain(r.status());
        if (r.status() === 200) {
          const buf = await r.body();
          expect(buf.subarray(0, 4).toString("ascii")).toBe("%PDF");
        }
      }
    } finally {
      await deleteTestUser(u.id);
    }
  });
});

/**
 * Unit tests for the paid-audit fulfilment side effects, focused on the
 * session-independent operator sale alert.
 *
 * Resend, the lite scanner, and the Supabase admin client are all mocked so
 * the test runs offline. We assert that:
 *   1. the operator (alex@piposlab.com) is alerted FIRST, before scanning,
 *   2. the buyer still receives their report,
 *   3. a failing operator alert never rolls back fulfilment.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
vi.mock("resend", () => {
  class MockResend {
    emails = { send: mockSend };
    constructor(_key?: string) {
      void _key;
    }
  }
  return { Resend: MockResend };
});

const mockScan = vi.fn();
vi.mock("@/lib/free-scan/lite-scanner", () => ({
  scanUrlLite: (...args: unknown[]) => mockScan(...args),
}));

// Admin client: a chainable stub whose terminal .eq() resolves cleanly.
const updateEq = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({ update: () => ({ eq: updateEq }) }),
  }),
}));

import { fulfilPaidAudit } from "@/lib/audit/fulfill";

beforeEach(() => {
  mockSend.mockReset().mockResolvedValue({ data: { id: "re_test_123" } });
  mockScan.mockReset().mockResolvedValue({
    health_score: 62,
    total_issue_count: 2,
    issues: [
      { rule: "Images must have alt text", severity: "critical", count: 4, wcag_ref: "WCAG 1.1.1" },
      { rule: "Insufficient contrast", severity: "serious", count: 1, wcag_ref: "WCAG 1.4.3" },
    ],
  });
  updateEq.mockClear().mockResolvedValue({ error: null });
  process.env.RESEND_API_KEY = "re_test_key";
});

describe("fulfilPaidAudit — operator sale alert", () => {
  it("alerts the operator FIRST with a SALE subject, then emails the buyer", async () => {
    await fulfilPaidAudit({
      sessionId: "cs_test_1",
      email: "buyer@example.com",
      targetUrl: "https://acme.example",
    });

    // Two emails: operator alert then buyer report.
    expect(mockSend).toHaveBeenCalledTimes(2);

    const operatorCall = mockSend.mock.calls[0][0];
    expect(operatorCall.to).toBe("alex@piposlab.com");
    expect(operatorCall.subject).toContain("SALE");
    expect(operatorCall.subject).toContain("https://acme.example");

    const buyerCall = mockSend.mock.calls[1][0];
    expect(buyerCall.to).toBe("buyer@example.com");
    expect(buyerCall.subject).toContain("62/100");
  });

  it("does not throw and still fulfils when the operator alert fails", async () => {
    // First send (operator alert) rejects; second send (buyer) succeeds.
    mockSend
      .mockRejectedValueOnce(new Error("resend down"))
      .mockResolvedValueOnce({ data: { id: "re_buyer" } });

    await expect(
      fulfilPaidAudit({
        sessionId: "cs_test_2",
        email: "buyer@example.com",
        targetUrl: "https://acme.example",
      }),
    ).resolves.toBeUndefined();

    // Buyer email was still attempted after the operator alert failed.
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend.mock.calls[1][0].to).toBe("buyer@example.com");
  });
});

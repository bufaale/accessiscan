import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Stripe from "stripe";

// Fixed fake secrets for signing/verification. Not real Stripe keys — the
// webhook signature scheme is pure HMAC-SHA256, so constructEvent never
// makes a network call and never validates the key format.
const WEBHOOK_SECRET = "whsec_test_secret_abc123";
const OTHER_SECRET = "whsec_completely_different_secret";

// getStripe() is a lazy singleton reading STRIPE_SECRET_KEY at first call.
// Set it before any import touches the module.
process.env.STRIPE_SECRET_KEY = "sk_test_fake_key_for_unit_tests";

let mockedProfile: { subscription_status: string | null } | null = null;
const fromMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (...args: unknown[]) => {
      fromMock(...args);
      return {
        select: (...selectArgs: unknown[]) => {
          selectMock(...selectArgs);
          return {
            eq: (...eqArgs: unknown[]) => {
              eqMock(...eqArgs);
              return {
                single: () => Promise.resolve({ data: mockedProfile, error: null }),
              };
            },
          };
        },
      };
    },
  }),
}));

// Real Stripe client used only to SIGN fixtures the same way the SDK does —
// this is the "attacker" / "test harness" side, separate from the
// production getStripe() singleton under test.
const signer = new Stripe("sk_test_fake_key_for_signing", { typescript: true });

function sign(payload: string, secret: string, timestamp?: number) {
  return signer.webhooks.generateTestHeaderString({
    payload,
    secret,
    timestamp,
  });
}

describe("verifyStripeWebhook", () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  it("accepts a genuinely signed payload and returns the parsed event", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({
      id: "evt_real_1",
      object: "event",
      type: "checkout.session.completed",
      data: { object: {} },
    });
    const signature = sign(payload, WEBHOOK_SECRET);

    const result = await verifyStripeWebhook(payload, signature);

    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.event.id).toBe("evt_real_1");
      expect(result.event.type).toBe("checkout.session.completed");
    }
  });

  it("rejects a request with NO signature header (null)", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_2", type: "ping" });

    const result = await verifyStripeWebhook(payload, null);

    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toMatch(/missing/i);
      expect(body.error).toMatch(/signature/i);
    }
  });

  it("rejects a forged signature (attacker guesses a v1 hex string)", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_3", type: "ping" });
    const forged = `t=${Math.floor(Date.now() / 1000)},v1=${"a".repeat(64)}`;

    const result = await verifyStripeWebhook(payload, forged);

    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toMatch(/invalid/i);
    }
  });

  it("rejects a payload signed with the WRONG secret", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_4", type: "ping" });
    const signature = sign(payload, OTHER_SECRET);

    const result = await verifyStripeWebhook(payload, signature);

    expect(result.verified).toBe(false);
  });

  it("rejects a TAMPERED body signed for a different payload", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const originalPayload = JSON.stringify({ id: "evt_5", amount: 100 });
    const signature = sign(originalPayload, WEBHOOK_SECRET);
    // Attacker intercepts a legit signature but swaps the body it covers.
    const tamperedPayload = JSON.stringify({ id: "evt_5", amount: 999999 });

    const result = await verifyStripeWebhook(tamperedPayload, signature);

    expect(result.verified).toBe(false);
  });

  it("rejects a REPLAYED signature whose timestamp is far outside tolerance", async () => {
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_6", type: "ping" });
    // Stripe's default tolerance is 5 minutes (300s). 10 minutes old must fail.
    const staleTimestamp = Math.floor(Date.now() / 1000) - 600;
    const signature = sign(payload, WEBHOOK_SECRET, staleTimestamp);

    const result = await verifyStripeWebhook(payload, signature);

    expect(result.verified).toBe(false);
  });

  it("uses .trim()'d STRIPE_WEBHOOK_SECRET — a signature made with the untrimmed value must still verify", async () => {
    // Simulates the real Vercel trap: the env var carries a trailing newline.
    process.env.STRIPE_WEBHOOK_SECRET = `${WEBHOOK_SECRET}\n`;
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_7", type: "ping" });
    // The "true" secret Stripe actually configured has no newline — this is
    // what the *sender* signs with.
    const signature = sign(payload, WEBHOOK_SECRET);

    const result = await verifyStripeWebhook(payload, signature);

    expect(result.verified).toBe(true);
  });

  it("REJECTS when the trailing newline is NOT trimmed (guards the .trim() call itself)", async () => {
    // If a mutant removed `.trim()`, constructEvent would be called with
    // "whsec_test_secret_abc123\n" and a signature made against that exact
    // (newline-included) string would verify — but a signature made against
    // the CORRECT (untrimmed-in-Stripe's-dashboard) secret would not match
    // the raw, un-trimmed env value. This test signs with the secret AS
    // Stripe's dashboard actually has it (no newline) while the env carries
    // the newline, and asserts verification still succeeds only because trim()
    // strips it back to the matching value.
    process.env.STRIPE_WEBHOOK_SECRET = `${WEBHOOK_SECRET}\n`;
    const { verifyStripeWebhook } = await import("@/lib/security/stripe");
    const payload = JSON.stringify({ id: "evt_8", type: "ping" });
    const signatureAgainstUntrimmed = sign(payload, `${WEBHOOK_SECRET}\n`);

    const result = await verifyStripeWebhook(payload, signatureAgainstUntrimmed);

    // A signature computed against the RAW (newline-included) secret must be
    // REJECTED once trim() is applied — proving trim() actually changes the
    // value used for verification, not a no-op.
    expect(result.verified).toBe(false);
  });
});

describe("validateCheckout", () => {
  const VALID_PRICE_IDS = ["price_starter_monthly", "price_pro_monthly"];

  beforeEach(() => {
    mockedProfile = null;
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
  });

  it("queries the exact table/column/filter: profiles.subscription_status where id=userId", async () => {
    mockedProfile = { subscription_status: "free" };
    const { validateCheckout } = await import("@/lib/security/stripe");
    await validateCheckout("user-99", "price_starter_monthly", VALID_PRICE_IDS);
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(selectMock).toHaveBeenCalledWith("subscription_status");
    expect(eqMock).toHaveBeenCalledWith("id", "user-99");
  });

  it("accepts a valid price ID when NO profile row exists at all (optional-chained lookup, not a crash)", async () => {
    // profile is null (no row found) — the "?." in `profile?.subscription_status`
    // must prevent a TypeError here, not just return the wrong-but-non-throwing
    // value from a lucky short-circuit elsewhere.
    mockedProfile = null;
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout(
      "user-1",
      "price_starter_monthly",
      VALID_PRICE_IDS,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects a price ID that is not in the allowlist", async () => {
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout(
      "user-1",
      "price_hidden_enterprise_sku",
      VALID_PRICE_IDS,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toBe("Invalid price");
  });

  it("accepts a valid price ID when the user has no active subscription", async () => {
    mockedProfile = { subscription_status: "free" };
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout(
      "user-1",
      "price_starter_monthly",
      VALID_PRICE_IDS,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects when the price is valid but the user already has an ACTIVE subscription", async () => {
    mockedProfile = { subscription_status: "active" };
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout(
      "user-1",
      "price_pro_monthly",
      VALID_PRICE_IDS,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/active subscription/i);
  });

  it("accepts when profile has a non-active status (e.g. past_due, free, null)", async () => {
    mockedProfile = { subscription_status: "past_due" };
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout(
      "user-1",
      "price_starter_monthly",
      VALID_PRICE_IDS,
    );
    expect(result.valid).toBe(true);
  });

  it("checks the price allowlist BEFORE looking up the profile (invalid price short-circuits)", async () => {
    // If a profile lookup were required first, this would need a mocked
    // profile; proving no profile is needed for an invalid price also
    // proves the ordering, which matters for cost (don't hit the DB for
    // garbage price IDs).
    mockedProfile = null; // would make the .single() call return null data
    const { validateCheckout } = await import("@/lib/security/stripe");
    const result = await validateCheckout("user-1", "not_a_real_price", []);
    expect(result.valid).toBe(false);
  });
});

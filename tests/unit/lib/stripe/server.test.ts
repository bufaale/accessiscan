import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Stripe from "stripe";

describe("getStripe", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("returns a real Stripe client instance", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    const { getStripe } = await import("@/lib/stripe/server");
    const client = getStripe();
    expect(client).toBeInstanceOf(Stripe);
  });

  it("returns the SAME instance on repeated calls (singleton, not recreated per call)", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    const { getStripe } = await import("@/lib/stripe/server");
    const first = getStripe();
    const second = getStripe();
    expect(first).toBe(second);
  });

  it("constructs the client with { typescript: true } (observable via Stripe's static USER_AGENT flag)", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    const { getStripe } = await import("@/lib/stripe/server");
    getStripe();
    expect(Stripe.USER_AGENT.typescript).toBe(true);
  });

  it("trims a trailing newline from STRIPE_SECRET_KEY (the Vercel env-var trap)", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123\n";
    const { getStripe } = await import("@/lib/stripe/server");
    const client = getStripe() as unknown as { _authenticator: { _apiKey: string } };
    // Internal, but it's the actual key handed to the Stripe SDK's
    // authenticator — the only observable proof .trim() ran.
    expect(client._authenticator._apiKey).toBe("sk_test_abc123");
  });
});

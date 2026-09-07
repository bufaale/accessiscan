import { describe, it, expect, vi, beforeEach } from "vitest";

let mockedUser: { id: string; email: string } | null = null;
let mockedAuthError: { message: string } | null = null;
let mockedProfile: { subscription_plan: string | null } | null = null;
const getUserMock = vi.fn(async () => ({
  data: { user: mockedUser },
  error: mockedAuthError,
}));
const fromMock = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
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

import { requireAuth, getUserPlan } from "@/lib/security/auth";

describe("requireAuth", () => {
  beforeEach(() => {
    mockedUser = null;
    mockedAuthError = null;
    getUserMock.mockClear();
  });

  it("rejects an unauthenticated request (no user, no error) with 401", async () => {
    mockedUser = null;
    mockedAuthError = null;

    const result = await requireAuth();

    expect(result.authenticated).toBe(false);
    if (!result.authenticated) {
      expect(result.response.status).toBe(401);
      const body = await result.response.json();
      expect(body.error).toBe("Unauthorized");
    }
  });

  it("rejects when Supabase returns an auth error even if a user object is present", async () => {
    mockedUser = { id: "u1", email: "a@example.com" };
    mockedAuthError = { message: "invalid token" };

    const result = await requireAuth();

    expect(result.authenticated).toBe(false);
    if (!result.authenticated) expect(result.response.status).toBe(401);
  });

  it("authenticates a valid user and returns id + email", async () => {
    mockedUser = { id: "user-42", email: "test@example.com" };
    mockedAuthError = null;

    const result = await requireAuth();

    expect(result.authenticated).toBe(true);
    if (result.authenticated) {
      expect(result.user.id).toBe("user-42");
      expect(result.user.email).toBe("test@example.com");
    }
  });

  it("uses getUser() (server-validated), not getSession() (cookie-based)", async () => {
    mockedUser = { id: "user-7", email: "x@example.com" };
    mockedAuthError = null;

    await requireAuth();

    expect(getUserMock).toHaveBeenCalledTimes(1);
  });
});

describe("getUserPlan", () => {
  beforeEach(() => {
    mockedProfile = null;
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
  });

  it("returns the stored subscription_plan when present", async () => {
    mockedProfile = { subscription_plan: "pro" };
    const plan = await getUserPlan("user-1");
    expect(plan).toBe("pro");
  });

  it("queries the exact table/column/filter: profiles.subscription_plan where id=userId", async () => {
    mockedProfile = { subscription_plan: "pro" };
    await getUserPlan("user-99");
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(selectMock).toHaveBeenCalledWith("subscription_plan");
    expect(eqMock).toHaveBeenCalledWith("id", "user-99");
  });

  it('defaults to "free" when subscription_plan is null', async () => {
    mockedProfile = { subscription_plan: null };
    const plan = await getUserPlan("user-1");
    expect(plan).toBe("free");
  });

  it('defaults to "free" when no profile row is found', async () => {
    mockedProfile = null;
    const plan = await getUserPlan("user-missing");
    expect(plan).toBe("free");
  });
});

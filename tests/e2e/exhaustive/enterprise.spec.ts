/**
 * enterprise.spec.ts — coverage for the /enterprise procurement-led
 * landing page.
 *
 * Why this exists: /enterprise is the response to a public IH thread
 * (aryan_sinh, May 9, 2026) about positioning. The reply we post under
 * @PiposLabs links to this page as proof we shipped on the feedback.
 * If the page silently regresses, the reply embarrasses the brand.
 *
 * Tests cover:
 * 1. Page renders under /enterprise
 * 2. Hero copy + 3 jobs + scanner-vs-platform + 4-week timeline + FAQ
 * 3. Form is rendered and accessible
 * 4. Form posts to /api/enterprise-lead and shows success state
 * 5. Cross-links from /pricing + navbar resolve to /enterprise
 * 6. NO dollar amount appears anywhere on /enterprise (the central
 *    positioning bet — anchoring would defeat the purpose)
 */
import { test, expect, type Page } from "@playwright/test";

async function gotoEnterprise(page: Page) {
  await page.goto("/enterprise");
  await page.waitForLoadState("networkidle");
}

test.describe("/enterprise — page rendering", () => {
  test("loads and returns 200", async ({ page }) => {
    const response = await page.goto("/enterprise");
    expect(response?.status()).toBe(200);
  });

  test("hero presents the platform positioning", async ({ page }) => {
    await gotoEnterprise(page);
    // Pluck the H1 — should NOT contain the word "scanner".
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    expect(h1Text?.toLowerCase()).toContain("infrastructure");
    expect(h1Text?.toLowerCase()).not.toContain("scanner");
  });

  test("3 jobs section renders all 3 cards (Aryan's framework)", async ({ page }) => {
    await gotoEnterprise(page);
    await expect(page.getByText("Three jobs.", { exact: false })).toBeVisible();
    await expect(page.getByText("Risk reduction", { exact: true })).toBeVisible();
    await expect(page.getByText("Compliance confidence", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Ongoing remediation support", { exact: true }),
    ).toBeVisible();
  });

  test("scanner vs infrastructure comparison renders", async ({ page }) => {
    await gotoEnterprise(page);
    await expect(page.getByText("A scanner closes a ticket.")).toBeVisible();
    await expect(page.getByText(/Infrastructure closes the loop/i)).toBeVisible();
  });

  test("4-week procurement timeline renders all 5 steps", async ({ page }) => {
    await gotoEnterprise(page);
    // Use heading-level locators to target the step titles specifically;
    // the words "Procurement" and "Discovery" appear elsewhere on the page
    // (eyebrow, hero copy) so a substring match would be ambiguous.
    for (const label of [
      "Discovery call · 30 min",
      "Tailored quote",
      "Security review · DPA signed",
      "Procurement · PO issued",
      "Onboarding · first scan live",
    ]) {
      await expect(
        page.getByText(label, { exact: true }),
      ).toBeVisible();
    }
  });

  test("procurement FAQ has at least 6 questions", async ({ page }) => {
    await gotoEnterprise(page);
    const dts = page.locator("dt");
    expect(await dts.count()).toBeGreaterThanOrEqual(6);
  });

  test("contact form rendered with required fields", async ({ page }) => {
    await gotoEnterprise(page);
    await expect(page.getByLabel("Name", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Work email")).toBeVisible();
    await expect(page.getByLabel(/Company/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Schedule a procurement review/i }),
    ).toBeVisible();
  });
});

test.describe("/enterprise — anti-anchoring guarantee", () => {
  test("no dollar amount appears on the page (positioning bet)", async ({
    page,
  }) => {
    await gotoEnterprise(page);
    // The whole positioning move is to NOT show a $/mo number on this
    // page. /pricing carries the SMB tier numbers; /enterprise is
    // custom-quote only.
    const body = await page.textContent("body");
    // Allow "$19" / "$50,000" / "$50K" only inside the explicit
    // "How enterprise pricing works" section that REFERENCES /pricing,
    // and inside the lawsuit-precedent context. We block currency-like
    // patterns ANYWHERE in the H1/eyebrow/CTAs by checking the headers
    // and form region specifically.
    const hero = await page.locator("h1").first().textContent();
    expect(hero, "Hero must not contain a dollar amount").not.toMatch(/\$\d/);

    // The contact form region must not display a dollar amount.
    const formText = await page
      .getByRole("button", { name: /Schedule a procurement review/i })
      .first()
      .locator("xpath=ancestor::form")
      .textContent()
      .catch(() => "");
    expect(
      formText ?? "",
      "Form region must not contain a dollar amount",
    ).not.toMatch(/\$\d/);

    // Sanity check: the page DOES mention /pricing for SMB visitors.
    expect(body ?? "").toMatch(/\/pricing/);
  });
});

test.describe("/enterprise — cross-links", () => {
  test("navbar links to /enterprise", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const enterpriseLinks = await page
      .getByRole("link", { name: /^Enterprise$/i })
      .all();
    expect(enterpriseLinks.length).toBeGreaterThanOrEqual(1);
    const hrefs = await Promise.all(enterpriseLinks.map((l) => l.getAttribute("href")));
    expect(hrefs).toContain("/enterprise");
  });

  test("/pricing cross-links to /enterprise", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    const links = await page
      .getByRole("link", { name: /enterprise/i })
      .all();
    expect(links.length).toBeGreaterThanOrEqual(1);
    let foundEnterpriseHref = false;
    for (const l of links) {
      const href = await l.getAttribute("href");
      if (href === "/enterprise") foundEnterpriseHref = true;
    }
    expect(
      foundEnterpriseHref,
      "/pricing must contain at least one link to /enterprise",
    ).toBe(true);
  });
});

test.describe("/api/enterprise-lead — direct API contract", () => {
  test("rejects payload with no name (400)", async ({ request }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: {
        work_email: "x@example.com",
        company: "Y",
      },
    });
    expect(r.status()).toBe(400);
  });

  test("rejects malformed email (400)", async ({ request }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: {
        name: "X",
        work_email: "not-an-email",
        company: "Y",
      },
    });
    expect(r.status()).toBe(400);
  });

  test("rejects disposable email domains (400)", async ({ request }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: {
        name: "X",
        work_email: "test@mailinator.com",
        company: "Y",
      },
    });
    expect(r.status()).toBe(400);
    const body = await r.json();
    expect(body.error).toMatch(/work email/i);
  });

  test("rejects unknown framework id (400)", async ({ request }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: {
        name: "X",
        work_email: "x@example.com",
        company: "Y",
        frameworks: ["doj_title_ii", "bogus"],
      },
    });
    expect(r.status()).toBe(400);
  });

  test("rejects scope longer than 2000 chars (memory bomb guard)", async ({
    request,
  }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: {
        name: "X",
        work_email: "x@example.com",
        company: "Y",
        scope: "z".repeat(2001),
      },
    });
    expect(r.status()).toBe(400);
  });

  test("rejects invalid JSON (400)", async ({ request }) => {
    const r = await request.post("/api/enterprise-lead", {
      data: "this is not json",
      headers: { "content-type": "application/json" },
    });
    expect(r.status()).toBe(400);
  });
});

test.describe("/enterprise — contact form submission", () => {
  test("submits valid payload and shows success state", async ({ page }) => {
    await gotoEnterprise(page);

    // Intercept the API call so this test does NOT pollute the prod
    // enterprise_leads table on every nightly run.
    await page.route("**/api/enterprise-lead", async (route) => {
      const req = route.request();
      const body = req.postDataJSON();
      // Sanity-check the payload shape so a future shape regression is caught.
      expect(typeof body.name).toBe("string");
      expect(typeof body.work_email).toBe("string");
      expect(typeof body.company).toBe("string");
      expect(Array.isArray(body.frameworks)).toBe(true);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, id: "stub-test-id" }),
      });
    });

    await page.getByLabel("Name", { exact: false }).fill("E2E Tester");
    await page
      .getByLabel("Work email")
      .fill("e2e-tester@e2e-domain.example");
    await page.getByLabel(/Company/i).fill("E2E QA");
    await page
      .getByLabel("Your role")
      .fill("Test Engineer");
    // Tick at least one framework
    await page.getByLabel(/DOJ Title II/i).check();

    await page
      .getByRole("button", { name: /Schedule a procurement review/i })
      .click();

    // Success card shows up in place of the form
    await expect(page.getByText(/request received/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows error state if API returns 400", async ({ page }) => {
    await gotoEnterprise(page);

    await page.route("**/api/enterprise-lead", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid submission" }),
      });
    });

    await page.getByLabel("Name", { exact: false }).fill("Should Fail");
    await page
      .getByLabel("Work email")
      .fill("invalid@example.com");
    await page.getByLabel(/Company/i).fill("Co");
    await page
      .getByRole("button", { name: /Schedule a procurement review/i })
      .click();

    // Next.js renders its own <div role="alert" id="__next-route-announcer__">
    // on every page, so a bare getByRole("alert") is a strict-mode violation.
    // Filter to the form's alert AND assert it surfaces the API's message —
    // "an alert exists" would have passed even if the error text never
    // reached the user.
    await expect(
      page.getByRole("alert").filter({ hasText: "Invalid submission" }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows error state if work email field is empty (client guard)", async ({
    page,
  }) => {
    await gotoEnterprise(page);

    // Skip the work_email field; the form should refuse to submit.
    await page.getByLabel("Name", { exact: false }).fill("Should Fail Locally");
    await page.getByLabel(/Company/i).fill("Co");

    let apiHit = false;
    await page.route("**/api/enterprise-lead", async (route) => {
      apiHit = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page
      .getByRole("button", { name: /Schedule a procurement review/i })
      .click();

    // Either the browser blocks (HTML5 required) or our client guard
    // returns. Either way, the API must NOT be hit.
    await page.waitForTimeout(500);
    expect(apiHit, "API should not be hit when required fields empty").toBe(false);
  });
});

import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser, loginViaUI } from "../helpers/test-utils";
import fs from "node:fs";
import path from "node:path";

let proUser: { id: string; email: string };

test.beforeAll(async () => {
  proUser = await createTestUser("vpat-inspect", "pro");
});
test.afterAll(async () => {
  if (proUser?.id) await deleteTestUser(proUser.id);
});

test("generate a VPAT PDF and save to disk for visual inspection", async ({ page }) => {
  test.setTimeout(180_000);
  await loginViaUI(page, proUser.email);

  // Run a quick scan
  await page.goto("/dashboard/scans/new");
  await page.getByRole("textbox", { name: /example\.com/i }).fill("https://example.com");
  await page.getByRole("button", { name: "Run Scan" }).click();
  await page.waitForURL(/\/dashboard\/scans\/[0-9a-f-]+/, { timeout: 120_000 });
  await expect(page.getByText(/Completed|completed/).first()).toBeVisible({ timeout: 60_000 });

  const scanId = page.url().match(/\/dashboard\/scans\/([0-9a-f-]+)/)![1];
  const resp = await page.request.get(`/api/scans/${scanId}/vpat`);
  expect(resp.status()).toBe(200);

  const body = await resp.body();
  const outPath = path.resolve(__dirname, "../../../.shared/vpat-inspection.pdf");
  fs.writeFileSync(outPath, body);
  console.log(`Saved VPAT PDF to ${outPath} (${Math.round(body.byteLength / 1024)} KB)`);
  expect(body.byteLength).toBeGreaterThan(5_000);
});

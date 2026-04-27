import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load .env.test.local (secrets) then .env.test (defaults)
dotenv.config({ path: path.resolve(__dirname, ".env.test.local") });
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const BASE_URL = process.env.TEST_BASE_URL || "https://app-04-ada-scanner.vercel.app";
// Spin up the local dev server automatically when targeting localhost. This
// lets `TEST_BASE_URL=http://localhost:3014 npx playwright test ...` work
// without remembering to start `npm run dev` in another terminal.
const useLocalDev = BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    // Visual regression tolerance — tight enough to catch real design
    // regressions, loose enough to survive sub-pixel font hinting in CI.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, threshold: 0.2 },
  },
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: useLocalDev
    ? {
        command: "npm run dev -- --port 3014",
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: true,
      }
    : undefined,
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});

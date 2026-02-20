import { chromium, type Browser, type Page } from "playwright";

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    });
  }
  return browser;
}

export async function getPageWithBrowser(url: string): Promise<{ page: Page; html: string; loadTime: number }> {
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setExtraHTTPHeaders({ "User-Agent": "ADAScanner/1.0 (Accessibility Compliance Checker)" });

  const start = Date.now();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const loadTime = Date.now() - start;

  const html = await page.content();
  return { page, html, loadTime };
}

export async function captureScreenshot(page: Page): Promise<Buffer> {
  return await page.screenshot({
    fullPage: true,
    type: "jpeg",
    quality: 75,
  }) as Buffer;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

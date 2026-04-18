import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('screenshots/v2', { recursive: true });

const targets = [
  { url: 'http://localhost:3003/', name: 'home-desktop', viewport: { width: 1440, height: 900 } },
  { url: 'http://localhost:3003/', name: 'home-mobile', viewport: { width: 390, height: 844 } },
  { url: 'http://localhost:3003/da/', name: 'home-da-desktop', viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: t.viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(t.url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `screenshots/v2/${t.name}.png`, fullPage: true });
  console.log(`[ok] ${t.name} -> screenshots/v2/${t.name}.png`);
  await ctx.close();
}
await browser.close();

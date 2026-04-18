import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('screenshots/v3', { recursive: true });

const browser = await chromium.launch();

async function shot(name, url, viewport, fullPage = false, scrollTo = null) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  if (scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
    }, scrollTo);
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `screenshots/v3/${name}.png`, fullPage });
  console.log(`[ok] ${name}`);
  await ctx.close();
}

await shot('home-full', 'http://localhost:3003/', { width: 1440, height: 900 }, true);
await shot('home-hero', 'http://localhost:3003/', { width: 1440, height: 900 }, false);
await shot('home-trust', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-trust');
await shot('home-why', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-why');
await shot('home-offer', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-offer');
await shot('home-work', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-work');
await shot('home-about', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-about');
await shot('home-engage', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-engage');
await shot('home-cta', 'http://localhost:3003/', { width: 1440, height: 900 }, false, '.mh-cta');
await shot('home-mobile-full', 'http://localhost:3003/', { width: 390, height: 844 }, true);
await shot('home-mobile-hero', 'http://localhost:3003/', { width: 390, height: 844 }, false);
await shot('home-da-full', 'http://localhost:3003/da/', { width: 1440, height: 900 }, true);

await browser.close();

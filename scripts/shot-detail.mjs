import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('screenshots/v2', { recursive: true });

const browser = await chromium.launch();

// Hero viewport
const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p1 = await ctx1.newPage();
await p1.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
await p1.screenshot({ path: 'screenshots/v2/home-hero.png', fullPage: false });
console.log('[ok] home-hero');

// Mobile viewport only
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const p2 = await ctx2.newPage();
await p2.goto('http://localhost:3003/', { waitUntil: 'networkidle' });
await p2.screenshot({ path: 'screenshots/v2/mobile-hero.png', fullPage: false });
console.log('[ok] mobile-hero');

// Scroll to channels
await p1.evaluate(() => window.scrollTo(0, 800));
await p1.waitForTimeout(300);
await p1.screenshot({ path: 'screenshots/v2/home-channels.png', fullPage: false });
console.log('[ok] home-channels');

// Scroll to first track
await p1.evaluate(() => window.scrollTo(0, 1400));
await p1.waitForTimeout(300);
await p1.screenshot({ path: 'screenshots/v2/home-track1.png', fullPage: false });
console.log('[ok] home-track1');

// Scroll to portfolio featured
await p1.evaluate(() => document.querySelector('.hp-work').scrollIntoView({ block: 'start' }));
await p1.waitForTimeout(300);
await p1.screenshot({ path: 'screenshots/v2/home-portfolio.png', fullPage: false });
console.log('[ok] home-portfolio');

// Scroll to how
await p1.evaluate(() => document.querySelector('.hp-how').scrollIntoView({ block: 'start' }));
await p1.waitForTimeout(300);
await p1.screenshot({ path: 'screenshots/v2/home-how.png', fullPage: false });
console.log('[ok] home-how');

// CTA
await p1.evaluate(() => document.querySelector('.hp-cta').scrollIntoView({ block: 'start' }));
await p1.waitForTimeout(300);
await p1.screenshot({ path: 'screenshots/v2/home-cta.png', fullPage: false });
console.log('[ok] home-cta');

await browser.close();

import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const pages = [
    { url: 'https://www.manoga.digital', name: 'home' },
    { url: 'https://www.manoga.digital/portfolio', name: 'portfolio' },
  ];
  
  for (const { url, name } of pages) {
    const desktopPage = await browser.newPage();
    await desktopPage.setViewportSize({ width: 1920, height: 1080 });
    await desktopPage.goto(url, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: `./ux-review/round-3/${name}_desktop.png`, fullPage: true });
    await desktopPage.close();
    console.log(`Captured: ${name}`);
  }
  
  await browser.close();
}

captureScreenshots().catch(console.error);

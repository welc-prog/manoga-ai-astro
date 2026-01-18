import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const pages = [
    { url: 'https://www.manoga.digital', name: 'home' },
    { url: 'https://www.manoga.digital/portfolio', name: 'portfolio' },
    { url: 'https://www.manoga.digital/contact', name: 'contact' },
    { url: 'https://www.manoga.digital/ai-consulting', name: 'ai-consulting' },
    { url: 'https://www.manoga.digital/vibecoding', name: 'vibecoding' },
  ];
  
  for (const { url, name } of pages) {
    // Desktop
    const desktopPage = await browser.newPage();
    await desktopPage.setViewportSize({ width: 1920, height: 1080 });
    await desktopPage.goto(url, { waitUntil: 'networkidle' });
    await desktopPage.screenshot({ path: `./ux-review/round-1/${name}_desktop.png`, fullPage: true });
    await desktopPage.close();
    
    // Mobile
    const mobilePage = await browser.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(url, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: `./ux-review/round-1/${name}_mobile.png`, fullPage: true });
    await mobilePage.close();
    
    console.log(`Captured: ${name}`);
  }
  
  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots().catch(console.error);

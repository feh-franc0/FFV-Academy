// landing-screenshot.mjs — automação Playwright pro loop de iteração visual.
//
// Tira screenshot do http://localhost:3000 em desktop + mobile e salva
// em /tmp/landing-iter-N-{desktop,mobile}.png. Passa N como arg.
//
// uso:
//   node scripts/landing-screenshot.mjs 1
//   node scripts/landing-screenshot.mjs 2 ...

import { chromium } from '@playwright/test';
import path from 'node:path';

const ITER = process.argv[2] ?? '0';
const OUT_DIR = '/tmp';

const URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      // Bloqueia onboarding e redirect homeBase pra screenshot consistente
      await page.goto(`${URL}/?skipOnboarding=1&nohome=1`, { waitUntil: 'networkidle' });

      // Scroll através da página inteira pra disparar IntersectionObserver
      // dos data-reveal animations (sections aparecem só quando vistas).
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let total = 0;
          const distance = 400;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            total += distance;
            if (total >= document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 80);
        });
      });
      await page.waitForTimeout(800);

      const out = path.join(OUT_DIR, `landing-iter-${ITER}-${vp.name}.png`);
      await page.screenshot({
        path: out,
        fullPage: true,
      });
      console.log(`✓ saved ${out}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

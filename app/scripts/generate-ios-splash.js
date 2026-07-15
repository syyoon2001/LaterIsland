// Generates iOS apple-touch-startup-image splash PNGs by actually rendering
// the real CoverScreen component (via splash.html/splash-main.tsx) in a
// headless browser at each target device's exact CSS viewport + device pixel
// ratio, so the splash is pixel-faithful to what CoverScreen shows in-app —
// no hand-copied colors/fonts to drift out of sync later.
//
// 실행: npm run generate:ios-splash  (app 폴더 기준)
import { createServer } from 'vite';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const outDir = path.join(appRoot, 'public', 'splash');

// Portrait iPhones from SE through the 16 Pro Max. Multiple models sharing
// the same logical width/height/DPR (e.g. 12 & 13 & 14) intentionally
// collapse to one generated file; index.html maps every device's own media
// query to whichever file matches its resolution.
const devices = [
  { name: 'iphone-se', width: 320, height: 568, dpr: 2 },
  { name: 'iphone-8', width: 375, height: 667, dpr: 2 },
  { name: 'iphone-8-plus', width: 414, height: 736, dpr: 3 },
  { name: 'iphone-x', width: 375, height: 812, dpr: 3 },
  { name: 'iphone-xr', width: 414, height: 896, dpr: 2 },
  { name: 'iphone-xs-max', width: 414, height: 896, dpr: 3 },
  { name: 'iphone-12', width: 390, height: 844, dpr: 3 },
  { name: 'iphone-12-pro-max', width: 428, height: 926, dpr: 3 },
  { name: 'iphone-14-pro', width: 393, height: 852, dpr: 3 },
  { name: 'iphone-14-pro-max', width: 430, height: 932, dpr: 3 },
  { name: 'iphone-16-pro', width: 402, height: 874, dpr: 3 },
  { name: 'iphone-16-pro-max', width: 440, height: 956, dpr: 3 },
];

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const server = await createServer({ root: appRoot, server: { port: 0 } });
  await server.listen();
  const port = server.httpServer.address().port;
  const url = `http://localhost:${port}/splash.html`;

  const browser = await chromium.launch();
  try {
    for (const d of devices) {
      const context = await browser.newContext({
        viewport: { width: d.width, height: d.height },
        deviceScaleFactor: d.dpr,
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
      });
      const file = path.join(outDir, `apple-splash-${d.name}.png`);
      await page.screenshot({ path: file });
      console.log(`wrote ${file} (${d.width * d.dpr}x${d.height * d.dpr})`);
      await context.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

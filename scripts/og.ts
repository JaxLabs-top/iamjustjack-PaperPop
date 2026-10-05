// Made by Jack (iamjustjack.de)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, '.og');

const { chromium } = await import('playwright');
const { preview, build } = await import('vite');
const sharp = (await import('sharp')).default;

const config = join(ROOT, 'docs/gallery/vite.config.ts');
await build({ configFile: config, logLevel: 'warn' });
const server = await preview({ configFile: config, preview: { port: 5191, strictPort: false }, logLevel: 'warn' });
const base = server.resolvedUrls!.local[0]!.replace(/\/$/, '');
const browser = await chromium.launch();
try {
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(`${base}/?og&capture`);
  await page.waitForSelector('#og');
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'og.png'), await sharp(png).png({ palette: true, quality: 92, effort: 8 }).toBuffer());
  console.log('og: .og/og.png');
} finally {
  await browser.close();
  await new Promise<void>((r) => server.httpServer.close(() => r()));
}

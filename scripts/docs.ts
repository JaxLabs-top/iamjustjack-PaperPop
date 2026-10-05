// Made by Jack (iamjustjack.de)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORIES } from '../stories';
import type { Step, Story } from '../stories/types';
import { CATEGORIES } from '../stories/types';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOCS = join(ROOT, 'docs/components');
const MEDIA = join(ROOT, 'docs/media');
const args = process.argv.slice(2);
const withMedia = !args.includes('--no-media');
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');

const HASHES = join(MEDIA, 'hashes.json');
const oldHashes: Record<string, string> = existsSync(HASHES) ? JSON.parse(readFileSync(HASHES, 'utf8')) : {};
const newHashes: Record<string, string> = {};

const slug = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

type Prop = { name: string; type: string; optional: boolean; default?: string; description: string };
type Iface = { name: string; file: string; extends: string[]; props: Prop[] };

const componentFiles = readdirSync(join(ROOT, 'src/components')).filter((f) => f.endsWith('.tsx')).map((f) => `src/components/${f}`);

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if ('<({['.includes(ch)) depth++;
    if ('>)}]'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseInterfaces(): Map<string, Iface> {
  const map = new Map<string, Iface>();
  for (const file of componentFiles) {
    const src = read(file);
    const re = /export interface (\w+)(?:<[^>{]*>)?(?:\s+extends\s+([^{]+))?\s*\{/g;
    for (let m = re.exec(src); m; m = re.exec(src)) {
      let i = re.lastIndex, depth = 1;
      const start = i;
      while (depth > 0 && i < src.length) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') depth--;
        i++;
      }
      const body = src.slice(start, i - 1);
      const props: Prop[] = [];
      let doc = '';
      let d = 0;
      for (const raw of body.split('\n')) {
        const line = raw.trim();
        const docLine = line.match(/^\/\*\*\s*(.*?)\s*\*\/$/);
        if (d === 0 && docLine) { doc = docLine[1]!; continue; }
        if (d === 0 && line.startsWith('/**')) { doc = line.slice(3).trim(); continue; }
        if (d === 0 && line.startsWith('*') && !line.startsWith('*/')) { doc += ` ${line.replace(/^\*\s?/, '')}`; continue; }
        if (d === 0 && line.startsWith('*/')) continue;
        const pm = d === 0 && line.match(/^(\w+)(\?)?:\s*(.+?);?$/);
        if (pm) {
          const def = doc.match(/@default\s+(.+)$/);
          props.push({
            name: pm[1]!, optional: !!pm[2], type: pm[3]!.replace(/;$/, ''),
            default: def?.[1]?.trim(), description: doc.replace(/@default\s+.+$/, '').trim(),
          });
          doc = '';
        }
        d += (line.match(/[{(]/g)?.length ?? 0) - (line.match(/[})]/g)?.length ?? 0);
        if (d < 0) d = 0;
      }
      map.set(m[1]!, { name: m[1]!, file, extends: m[2] ? splitTop(m[2]) : [], props });
    }
  }
  return map;
}

function sourceFileOf(name: string): string | undefined {
  return componentFiles.find((f) => new RegExp(`export function ${name}\\b`).test(read(f)));
}

function resolveProps(ifaces: Map<string, Iface>, name: string): { props: Prop[]; external: string[] } | undefined {
  const it = ifaces.get(name);
  if (!it) return undefined;
  const props = [...it.props];
  const external: string[] = [];
  for (const base of it.extends) {
    const local = ifaces.get(base.replace(/<.*$/, ''));
    if (local) {
      const r = resolveProps(ifaces, local.name)!;
      props.push(...r.props.filter((p) => !props.some((q) => q.name === p.name)));
      external.push(...r.external);
    } else external.push(base);
  }
  return { props, external };
}

function exampleSource(storyFile: string, name: string): string {
  const src = read(storyFile);
  const at = src.indexOf(`name: '${name}',`);
  const ex = src.indexOf('example:', at);
  if (at < 0 || ex < 0) return '';
  let i = ex + 'example:'.length;
  const start = i;
  for (let depth = 0; i < src.length; i++) {
    const ch = src[i]!;
    if ('({['.includes(ch)) depth++;
    else if (')}]'.includes(ch)) {
      if (depth === 0) break;
      depth--;
    } else if (ch === ',' && depth === 0) break;
  }
  let code = src.slice(start, i).trim().replace(/,$/, '');
  const arrow = code.match(/^\(\)\s*=>\s*\(([\s\S]*)\)$/);
  if (arrow) code = arrow[1]!;
  else if (code.startsWith('() =>')) code = code.replace(/^\(\)\s*=>\s*/, '');
  const lines = code.split('\n');
  while (lines.length && !lines[0]!.trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1]!.trim()) lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim()).slice(1).map((l) => l.match(/^ */)![0].length), lines[0]!.match(/^ */)![0].length || Infinity);
  return lines.map((l, idx) => (idx === 0 ? l.trimStart() : l.slice(Number.isFinite(indent) ? indent : 0))).join('\n');
}

function importsFor(storyFile: string, code: string): string {
  const src = read(storyFile);
  const names = src.match(/import \{([^}]+)\} from '\.\.\/src'/)?.[1]?.split(',').map((s) => s.trim().replace(/^type\s+/, '')).filter(Boolean) ?? [];
  const used = names.filter((n) => new RegExp(`\\b${n}\\b`).test(code));
  const react = ['useState', 'useEffect', 'useRef'].filter((n) => new RegExp(`\\b${n}\\b`).test(code));
  return [
    react.length ? `import { ${react.join(', ')} } from 'react';` : '',
    used.length ? `import { ${used.join(', ')} } from 'paperpop';` : '',
  ].filter(Boolean).join('\n');
}

const storyFiles = readdirSync(join(ROOT, 'stories')).filter((f) => f.endsWith('.stories.tsx')).map((f) => `stories/${f}`);
const storyFileOf = (name: string) => storyFiles.find((f) => read(f).includes(`name: '${name}',`))!;

async function captureAll(stories: Story[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  let skipped = 0;
  const unchanged = (file: string) => newHashes[file] === oldHashes[file] && existsSync(join(MEDIA, file));
  const { chromium } = await import('playwright');
  const { preview, build } = await import('vite');
  const sharp = (await import('sharp')).default;
  const { PNG } = await import('pngjs');
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

  const config = join(ROOT, 'docs/gallery/vite.config.ts');
  await build({ configFile: config, logLevel: 'warn' });
  const server = await preview({ configFile: config, preview: { port: 5191, strictPort: false }, logLevel: 'warn' });
  const base = server.resolvedUrls!.local[0]!.replace(/\/$/, '');
  const browser = await chromium.launch();
  mkdirSync(MEDIA, { recursive: true });

  try {
    for (const s of stories) {
      const animated = !!s.animation;
      const ctx = await browser.newContext({
        viewport: s.viewport ?? { width: 1400, height: 1000 },
        deviceScaleFactor: animated ? 1 : 2,
        reducedMotion: 'no-preference',
      });
      const page = await ctx.newPage();
      await page.clock.install({ time: new Date('2026-09-18T10:00:00Z') });
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Animation.enable');
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
      await page.goto(`${base}/?story=${encodeURIComponent(s.name)}&capture`);
      await page.waitForSelector('#stage');
      await page.evaluate(() => document.fonts.ready);
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
      await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 50)));

      const advance = async (ms: number) => {
        if (ms) await page.clock.runFor(ms);
        await page.evaluate((dt) => {
          for (const a of document.getAnimations()) {
            const x = a as Animation & { __ppT?: number };
            x.__ppT = (x.__ppT ?? 0) + dt;
            a.pause();
            a.currentTime = x.__ppT;
          }
        }, ms);
      };
      await advance(0);

      const stage = page.locator('#stage');
      const box = s.viewport ? { x: 0, y: 0, ...s.viewport } : (await stage.boundingBox())!;
      const clip = { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width), height: Math.ceil(box.height) };
      const file = `${slug(s.name)}.${animated ? 'gif' : 'png'}`;

      if (!animated) {
        await advance(3000);
        await advance(3000);
        const png = await page.screenshot({ clip });
        newHashes[file] = createHash('sha1').update(png).digest('hex');
        if (unchanged(file)) skipped++;
        else writeFileSync(join(MEDIA, file), await sharp(png).png({ palette: true, quality: 92, effort: 8 }).toBuffer());
      } else {
        const fps = s.animation!.fps ?? 20;
        const dt = Math.round(1000 / fps);
        const steps: Step[] = s.animation!.steps ?? [{ wait: s.animation!.duration ?? 1500 }];
        const frames: Array<{ rgba: Uint8Array; delay: number }> = [];
        const shoot = async (delay: number) => {
          const img = PNG.sync.read(await page.screenshot({ clip }));
          frames.push({ rgba: new Uint8Array(img.data.buffer, img.data.byteOffset, img.data.length), delay });
        };
        const sel = (q: string) => `#stage ${q}`;
        await shoot(400);
        for (const step of steps) {
          if ('wait' in step) {
            for (let t = 0; t < step.wait; t += dt) { await advance(dt); await shoot(dt); }
            continue;
          }
          if ('hover' in step) await page.hover(sel(step.hover));
          else if ('leave' in step) await page.mouse.move(2, 2);
          else if ('click' in step) await page.click(sel(step.click));
          else if ('focus' in step) await page.focus(sel(step.focus));
          else if ('type' in step) await page.fill(sel(step.type), step.text);
          await advance(dt);
          await shoot(dt);
        }
        frames[frames.length - 1]!.delay += 1400;

        const h = createHash('sha1');
        for (const f of frames) h.update(f.rgba).update(String(f.delay));
        newHashes[file] = h.digest('hex');
        if (unchanged(file)) {
          skipped++;
          out.set(s.name, file);
          console.log(`  = ${s.name} (unchanged)`);
          await ctx.close();
          continue;
        }

        const pick = [frames[0]!, frames[Math.floor(frames.length / 2)]!, frames[frames.length - 1]!];
        const sample = new Uint8Array(pick.reduce((n, f) => n + f.rgba.length, 0));
        let off = 0;
        for (const f of pick) { sample.set(f.rgba, off); off += f.rgba.length; }
        const palette = quantize(sample, 256);
        const gif = GIFEncoder();
        let prev: Uint8Array | null = null;
        const pending: Array<{ index: Uint8Array; delay: number }> = [];
        for (const f of frames) {
          const index = applyPalette(f.rgba, palette);
          if (prev && index.length === prev.length && index.every((v: number, k: number) => v === prev![k])) {
            pending[pending.length - 1]!.delay += f.delay;
          } else pending.push({ index, delay: f.delay });
          prev = index;
        }
        pending.forEach((f, k) => gif.writeFrame(f.index, clip.width, clip.height, k === 0 ? { palette, delay: f.delay, repeat: 0 } : { delay: f.delay }));
        gif.finish();
        writeFileSync(join(MEDIA, file), gif.bytes());
      }
      out.set(s.name, file);
      console.log(`  ✓ ${s.name} → ${file}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
    await new Promise<void>((r) => server.httpServer.close(() => r()));
  }
  console.log(`  ${skipped} of ${stories.length} unchanged, left untouched`);
  return out;
}

const esc = (s: string) => s.replace(/\|/g, '\\|');
const escText = (s: string) => esc(s).replace(/</g, '&lt;');

function propsTable(ifaces: Map<string, Iface>, exp: string): string {
  const r = resolveProps(ifaces, `${exp}Props`);
  if (!r) return '';
  const rows = r.props.map((p) => `| \`${p.name}\`${p.optional ? '' : ' *'} | \`${esc(p.type)}\` | ${p.default ? `\`${esc(p.default)}\`` : ''} | ${escText(p.description)} |`);
  const ext = r.external.length ? `\n\nAlso accepts: ${r.external.map((e) => `\`${esc(e)}\``).join(', ')} (native attributes are passed through).` : '';
  return `### ${exp}\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}${ext}\n\n\\* required`;
}

async function main() {
  const selected = only ? STORIES.filter((s) => only.includes(s.name)) : STORIES;
  const ifaces = parseInterfaces();

  let media = new Map<string, string>();
  if (withMedia) {
    console.log(`capturing ${selected.length} stories …`);
    media = await captureAll(selected);
    const live = new Set(STORIES.flatMap((s) => ['gif', 'png'].map((e) => `${slug(s.name)}.${e}`)));
    for (const f of readdirSync(MEDIA)) if (f !== 'hashes.json' && !(f in newHashes) && !(only && live.has(f))) rmSync(join(MEDIA, f), { force: true });
    const merged = only ? { ...oldHashes, ...newHashes } : newHashes;
    writeFileSync(HASHES, `${JSON.stringify(Object.fromEntries(Object.entries(merged).sort()), null, 2)}\n`);
  }
  for (const s of STORIES) {
    if (media.has(s.name)) continue;
    for (const ext of ['gif', 'png']) if (existsSync(join(MEDIA, `${slug(s.name)}.${ext}`))) media.set(s.name, `${slug(s.name)}.${ext}`);
  }

  rmSync(DOCS, { recursive: true, force: true });
  mkdirSync(DOCS, { recursive: true });
  const manifest = [];
  for (const s of STORIES) {
    const storyFile = storyFileOf(s.name);
    const example = exampleSource(storyFile, s.name);
    const imports = importsFor(storyFile, example);
    const exps = s.exports ?? [s.name];
    const source = sourceFileOf(exps[0]!);
    const file = media.get(s.name);
    const tables = exps.map((e) => propsTable(ifaces, e)).filter(Boolean);
    const md = [
      `# ${s.name}`,
      `**${s.category}** · [all components](../../README.md#components)${s.animation ? ' · animated' : ''}`,
      s.description,
      file ? `![${s.name}](../media/${file})` : '',
      '## Usage',
      '```tsx\n' + `${imports}\n\n${example}` + '\n```',
      s.notes ? `## Notes\n\n${s.notes}` : '',
      tables.length ? `## Props\n\n${tables.join('\n\n')}` : '',
      '## Source',
      [source && `- Component: [\`${source}\`](../../${source})`, `- Example: [\`${storyFile}\`](../../${storyFile})`].filter(Boolean).join('\n'),
      '',
      '<!-- Generated by scripts/docs.ts - edit the component or its story, not this file. -->',
    ].filter((x) => x !== '').join('\n\n');
    writeFileSync(join(DOCS, `${s.name}.md`), `${md}\n`);
    manifest.push({
      name: s.name,
      category: s.category,
      description: s.description,
      notes: s.notes ?? null,
      exports: exps,
      animated: !!s.animation,
      source: source ?? null,
      story: storyFile,
      doc: `docs/components/${s.name}.md`,
      media: file ? `docs/media/${file}` : null,
      example: `${imports}\n\n${example}`,
      props: Object.fromEntries(exps.map((e) => [e, resolveProps(ifaces, `${e}Props`) ?? null])),
    });
  }
  writeFileSync(join(ROOT, 'docs/components.json'), `${JSON.stringify({ generated: 'scripts/docs.ts', count: manifest.length, components: manifest }, null, 2)}\n`);

  const readme = read('README.md');
  const blocks = CATEGORIES.map((cat) => {
    const items = STORIES.filter((s) => s.category === cat);
    if (!items.length) return '';
    const cells = items.map((s) => {
      const f = media.get(s.name);
      const img = f ? `<a href="docs/components/${s.name}.md"><img src="docs/media/${f}" alt="${s.name}" width="260"></a><br>` : '';
      return `<td width="33%" valign="top">${img}<b><a href="docs/components/${s.name}.md">${s.name}</a></b>${s.animation ? ' ✦' : ''}<br><sub>${s.description.replace(/</g, '&lt;')}</sub></td>`;
    });
    const rows: string[] = [];
    for (let i = 0; i < cells.length; i += 3) rows.push(`<tr>${cells.slice(i, i + 3).join('')}</tr>`);
    return `### ${cat}\n\n<table>\n${rows.join('\n')}\n</table>`;
  }).filter(Boolean);
  const section = `<!-- COMPONENTS:START -->\n<!-- Generated by scripts/docs.ts on every push - do not edit by hand. -->\n\n**${STORIES.length} components** in ${blocks.length} categories. ✦ = animated (GIF).\n\n${blocks.join('\n\n')}\n\n<!-- COMPONENTS:END -->`;
  const next = readme.replace(/<!-- COMPONENTS:START -->[\s\S]*<!-- COMPONENTS:END -->/, section);
  writeFileSync(join(ROOT, 'README.md'), next);

  console.log(`docs: ${STORIES.length} pages, ${media.size} media files`);
  const broken = manifest.filter((m) => !m.example.trim() || m.example.trim().length < 10).map((m) => m.name);
  if (broken.length) throw new Error(`empty example snippet for: ${broken.join(', ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

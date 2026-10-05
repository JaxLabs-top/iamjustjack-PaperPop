// Made by Jack (iamjustjack.de)
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { paperpop } from '../../vite';

const OG = fileURLToPath(new URL('../../.og/og.png', import.meta.url));

const ogImage = () => ({
  name: 'paperpop-og-image',
  generateBundle(this: { emitFile: (f: { type: 'asset'; fileName: string; source: Uint8Array }) => void }) {
    if (existsSync(OG)) this.emitFile({ type: 'asset', fileName: 'og.png', source: readFileSync(OG) });
  },
});

const DOCS = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://paperpop.iamjustjack.de';

const agentDocs = () => ({
  name: 'paperpop-agent-docs',
  generateBundle(this: { emitFile: (f: { type: 'asset'; fileName: string; source: string }) => void }) {
    const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source });
    const list = (dir: string) => (existsSync(join(DOCS, dir)) ? readdirSync(join(DOCS, dir)).filter((f) => f.endsWith('.md')).sort() : []);
    const read = (p: string) => readFileSync(join(DOCS, p), 'utf8');
    const manifest = JSON.parse(read('components.json')) as { components: { name: string; category: string; description: string }[] };
    const guides = list('guides');

    const index = [
      '# Paper Pop',
      '',
      '> React component library with a torn paper, pastel and polaroid look (iamjustjack.de). ' + `${manifest.components.length} components, each with a live demo, props and a copy-paste example.`,
      '',
      'Usage: add the repo as a git submodule, `import { Component } from \'paperpop\'` and `import \'paperpop/styles.css\'`. Claude Code can use the dependency-free MCP server `mcp/server.mjs` to look components up (also hosted: ' + SITE + '/mcp). UI copy is German.',
      '',
      '## Guides',
      '',
      ...guides.map((f) => `- [${f.replace(/\.md$/, '')}](${SITE}/docs/guides/${f})`),
      '',
      '## Machine-readable',
      '',
      `- [components.json](${SITE}/components.json): manifest with props, notes and examples of every component`,
      `- [llms-full.txt](${SITE}/llms-full.txt): all guides and component pages in one file`,
      '',
      ...[...new Set(manifest.components.map((c) => c.category))].flatMap((cat) => [
        `## ${cat}`,
        '',
        ...manifest.components.filter((c) => c.category === cat).map((c) => `- [${c.name}](${SITE}/docs/components/${c.name}.md): ${c.description}`),
        '',
      ]),
    ].join('\n');

    emit('llms.txt', index);
    emit('llms-full.txt', [index, ...guides.map((f) => read(`guides/${f}`)), ...list('components').map((f) => read(`components/${f}`))].join('\n\n---\n\n'));
    emit('components.json', read('components.json'));
    for (const f of guides) emit(`docs/guides/${f}`, read(`guides/${f}`));
    for (const f of list('components')) emit(`docs/components/${f}`, read(`components/${f}`));
  },
});

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), paperpop(), ogImage(), agentDocs()],
  base: './',
  build: { outDir: fileURLToPath(new URL('../../dist/gallery', import.meta.url)), emptyOutDir: true },
  server: { port: 5190 },
  preview: { port: 5191 },
});

#!/usr/bin/env node
// Made by Jack (iamjustjack.de)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const exists = (p) => existsSync(join(ROOT, p));

function manifest() {
  if (!exists('docs/components.json')) return { components: [] };
  return JSON.parse(read('docs/components.json'));
}

function findComponent(name) {
  const all = manifest().components;
  const n = String(name ?? '').toLowerCase();
  return all.find((c) => c.name.toLowerCase() === n) ?? all.find((c) => c.exports.some((e) => e.toLowerCase() === n));
}

function componentSource(file, name) {
  if (!file || !exists(file)) return '';
  const src = read(file);
  const start = src.search(new RegExp(`(^/\\*\\*[^]*?\\*/\\n)?^export function ${name}\\b`, 'm'));
  if (start < 0) return '';
  const rest = src.slice(start);
  const end = rest.slice(1).search(/\nexport (function|interface|type|const) /);
  const iface = src.match(new RegExp(`export interface ${name}Props[^]*?\\n}\\n`))?.[0] ?? '';
  return `${iface}\n${end < 0 ? rest : rest.slice(0, end + 1)}`.trim();
}

const guide = (n) => (exists(`docs/guides/${n}.md`) ? read(`docs/guides/${n}.md`) : `Guide ${n} not found.`);

function tokens() {
  const css = read('src/styles/tokens.css');
  const edges = [...read('src/styles/torn.css').matchAll(/\.pp-t-([\w-]+)\{/g), ...read('src/styles/torn-generated.css').matchAll(/\.pp-t-([\w-]+)\{/g)].map((m) => m[1]);
  return [
    '# Paper Pop design tokens',
    '',
    '```css',
    css.trim(),
    '```',
    '',
    `Torn edges (Paper \`edge\` prop / \`pp-t-<edge>\` classes): ${edges.join(', ')}`,
    '',
    'Palette names for `color` props: paper, pink, butter, mint, sky, lilac (+ ink where a Tone is accepted).',
    'Utility classes: pp-display (display font), pp-hand (marker font), pp-caps (small caps label), pp-soft (muted text),',
    'pp-visually-hidden, pp-c-<color> (sets --c/--c2), pp-bg-<color> (paper fill), pp-tilt (rotate by --r).',
    'Body: class pp-ground-grid | pp-ground-plain; <html class="pp-no-grain"> removes the paper grain.',
    'Fonts: Dela Gothic One (display), IBM Plex Mono (body), Permanent Marker (hand) - import "paperpop/fonts".',
  ].join('\n');
}

const TOOLS = [
  {
    name: 'list_components',
    description: 'List all Paper Pop components (name, category, one-line description, animated). Optionally filter by category: Foundations, Buttons, Forms, Feedback, Navigation, Layout, Dashboard, Landing, Forum, Apps.',
    inputSchema: { type: 'object', properties: { category: { type: 'string' } } },
    run: ({ category }) => {
      const list = manifest().components.filter((c) => !category || c.category.toLowerCase() === String(category).toLowerCase());
      const byCat = {};
      for (const c of list) (byCat[c.category] ??= []).push(`- **${c.name}**${c.exports.length > 1 ? ` (${c.exports.join(', ')})` : ''}${c.animated ? ' ✦' : ''}: ${c.description}`);
      return Object.entries(byCat).map(([k, v]) => `## ${k}\n${v.join('\n')}`).join('\n\n') || 'No components found.';
    },
  },
  {
    name: 'search_components',
    description: 'Search components by keyword across names, descriptions, notes and prop names (e.g. "chart", "upload", "tooltip", "vote").',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    run: ({ query }) => {
      const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
      const scored = manifest().components.map((c) => {
        const hay = [c.name, c.category, c.description, c.notes ?? '', ...c.exports, ...Object.values(c.props).flatMap((p) => p?.props.map((x) => `${x.name} ${x.description}`) ?? [])].join(' ').toLowerCase();
        const score = words.reduce((s, w) => s + (c.name.toLowerCase().includes(w) ? 5 : 0) + (hay.includes(w) ? 1 : 0), 0);
        return { c, score };
      }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
      return scored.length ? scored.map(({ c }) => `- **${c.name}** (${c.category}): ${c.description}`).join('\n') : `Nothing matches "${query}". Try list_components.`;
    },
  },
  {
    name: 'get_component',
    description: 'Full documentation for one component: usage example, props tables, notes, plus the component source code. Use before using or changing a component.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, includeSource: { type: 'boolean', description: 'default true' } }, required: ['name'] },
    run: ({ name, includeSource = true }) => {
      const c = findComponent(name);
      if (!c) return `Unknown component "${name}". Use search_components.`;
      const doc = exists(c.doc) ? read(c.doc) : c.description;
      const src = includeSource ? c.exports.map((e) => componentSource(c.source, e)).filter(Boolean).join('\n\n') : '';
      return `${doc}\n${src ? `\n## Source (${c.source})\n\n\`\`\`tsx\n${src}\n\`\`\`\n` : ''}`;
    },
  },
  {
    name: 'get_design_tokens',
    description: 'Colours, fonts, shadows, torn-edge shapes and utility classes of Paper Pop.',
    inputSchema: { type: 'object', properties: {} },
    run: () => tokens(),
  },
  {
    name: 'get_setup_guide',
    description: 'How to add Paper Pop to a site: git submodule, Vite plugin, tsconfig paths, root imports, MCP config, CI token.',
    inputSchema: { type: 'object', properties: {} },
    run: () => guide('setup'),
  },
  {
    name: 'get_page_recipe',
    description: 'Page skeletons composed from Paper Pop components. type: landing | dashboard | forum | app | links | legal (omit for all).',
    inputSchema: { type: 'object', properties: { type: { type: 'string' } } },
    run: ({ type }) => {
      const all = guide('recipes');
      if (!type) return all;
      const part = all.split(/\n(?=## )/).find((s) => s.startsWith(`## ${String(type).toLowerCase()}`));
      return part ?? `No recipe "${type}". Available: landing, dashboard, forum, app, links, legal.`;
    },
  },
  {
    name: 'get_contributing_guide',
    description: 'Conventions for adding a new component to Paper Pop (file layout, props docs, stories, animations, docs pipeline).',
    inputSchema: { type: 'object', properties: {} },
    run: () => guide('contributing'),
  },
];

function resources() {
  const list = manifest().components.map((c) => ({ uri: `paperpop://components/${c.name}`, name: c.name, description: c.description, mimeType: 'text/markdown' }));
  for (const g of exists('docs/guides') ? readdirSync(join(ROOT, 'docs/guides')) : []) {
    const n = g.replace(/\.md$/, '');
    list.push({ uri: `paperpop://guides/${n}`, name: `guide: ${n}`, mimeType: 'text/markdown' });
  }
  list.push({ uri: 'paperpop://tokens', name: 'design tokens', mimeType: 'text/markdown' });
  return list;
}

function readResource(uri) {
  const m = String(uri).match(/^paperpop:\/\/(components|guides)\/(.+)$/);
  if (uri === 'paperpop://tokens') return tokens();
  if (m?.[1] === 'components') {
    const c = findComponent(m[2]);
    if (c && exists(c.doc)) return read(c.doc);
  }
  if (m?.[1] === 'guides') return guide(m[2]);
  throw Object.assign(new Error(`Unknown resource ${uri}`), { code: -32002 });
}

const send = (msg) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...msg })}\n`);
const version = JSON.parse(read('package.json')).version;

export function handle(req) {
  const { method, params = {} } = req;
  switch (method) {
    case 'initialize':
      return {
        protocolVersion: params.protocolVersion ?? '2025-06-18',
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: 'paperpop', version },
        instructions:
          'Paper Pop is the React component library (torn paper, pastels, polaroids) for Jack\'s sites. Before building UI, call list_components or search_components and reuse existing components; read get_component for props and examples. Import from "paperpop". New generic components belong in the paperpop submodule (see get_contributing_guide), not in the site.',
      };
    case 'ping':
      return {};
    case 'tools/list':
      return { tools: TOOLS.map(({ run, ...t }) => t) };
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) throw Object.assign(new Error(`Unknown tool ${params.name}`), { code: -32602 });
      try {
        return { content: [{ type: 'text', text: tool.run(params.arguments ?? {}) }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
      }
    }
    case 'resources/list':
      return { resources: resources() };
    case 'resources/read':
      return { contents: [{ uri: params.uri, mimeType: 'text/markdown', text: readResource(params.uri) }] };
    case 'prompts/list':
      return { prompts: [] };
    default:
      throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createInterface({ input: process.stdin }).on('line', (line) => {
    if (!line.trim()) return;
    let req;
    try {
      req = JSON.parse(line);
    } catch {
      return send({ id: null, error: { code: -32700, message: 'Parse error' } });
    }
    if (req.id === undefined || req.id === null) return;
    try {
      send({ id: req.id, result: handle(req) });
    } catch (e) {
      send({ id: req.id, error: { code: e.code ?? -32603, message: e.message } });
    }
  });
}

<!-- Made by Jack (iamjustjack.de) -->
# Setup: Paper Pop in a site

Paper Pop is consumed as a **git submodule** at `paperpop/` and compiled together with the site by Vite. There is no build step and no npm package - you always get the sources, including HMR while editing components.

The quickest start is the template repo **JaxLabs-top/PaperPop-Template** (Vite + React + router, example pages, Docker deploy, MCP config). Use it for new sites. For an existing site:

## 1. Add the submodule

```bash
git submodule add https://github.com/JaxLabs-top/iamjustjack-PaperPop.git paperpop
git commit -m "Add Paper Pop as submodule"
```

Cloning a site later: `git clone --recurse-submodules <url>` or `git submodule update --init` after a normal clone.
Updating to the newest Paper Pop: `git submodule update --remote paperpop && git commit -am "Update Paper Pop"`.

## 2. Dependencies of the site

```bash
npm i react react-dom
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  @fontsource/dela-gothic-one @fontsource/ibm-plex-mono @fontsource/permanent-marker
```

Paper Pop itself has no runtime dependencies besides React.

## 3. Vite

```ts
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { paperpop } from './paperpop/vite';

export default defineConfig({ plugins: [react(), paperpop()] });
```

The plugin maps `paperpop` and `paperpop/*` to the submodule sources and dedupes React.

## 4. TypeScript

```jsonc
// tsconfig.json (compilerOptions)
"paths": {
  "paperpop": ["./paperpop/src/index.ts"],
  "paperpop/*": ["./paperpop/src/*"]
}
// and add "paperpop/src" to "include"
```

## 5. Import once at the root

```tsx
// main.tsx
import 'paperpop/fonts';        // self-hosted fonts (no Google requests)
import 'paperpop/styles.css';   // all component styles + tokens
import { PaperPopEffects, ToastProvider } from 'paperpop';

createRoot(root).render(
  <ToastProvider>
    <PaperPopEffects />   {/* sparkles on click + washi text selection */}
    <App />
  </ToastProvider>,
);
```

Page background: `<body class="pp-ground-grid">` for grid paper, default is dots, `pp-ground-plain` for none. Change the ground colour with `:root { --pp-ground: var(--pp-cream); }`. Turn off the paper grain with `<html class="pp-no-grain">`.

## 6. MCP server for Claude Code

```json
// .mcp.json in the site repo
{ "mcpServers": { "paperpop": { "command": "node", "args": ["paperpop/mcp/server.mjs"] } } }
```

The server needs no `npm install` - it only reads the docs in the submodule.

Without the submodule the same tools are hosted at `https://paperpop.iamjustjack.de/mcp` (Streamable HTTP, read-only, no auth):

```json
{ "mcpServers": { "paperpop": { "type": "http", "url": "https://paperpop.iamjustjack.de/mcp" } } }
```

## 7. CI / Docker

The submodule repo is private, so the default `GITHUB_TOKEN` can't clone it. Use a read-only **deploy key** (never expires,
one key works for every site):

```bash
ssh-keygen -t ed25519 -N "" -C "paperpop-deploy" -f paperpop_deploy
```

- `iamjustjack-PaperPop` → Settings → Deploy keys → add `paperpop_deploy.pub` (no write access)
- site repo → Settings → Secrets → Actions → `PAPERPOP_DEPLOY_KEY` = content of `paperpop_deploy`

Then check out normally and fetch the submodule over SSH (the template's `deploy.yml` already does this, it also accepts
a fine-grained PAT in `PAPERPOP_TOKEN` as fallback):

```yaml
- uses: actions/checkout@v4
- name: Fetch Paper Pop submodule
  env:
    PAPERPOP_DEPLOY_KEY: ${{ secrets.PAPERPOP_DEPLOY_KEY }}
  run: |
    key=$(mktemp); printf '%s\n' "$PAPERPOP_DEPLOY_KEY" > "$key"; chmod 600 "$key"
    git -c url."git@github.com:".insteadOf="https://github.com/" \
        -c core.sshCommand="ssh -i $key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
        submodule update --init --depth=1 --recursive
    rm -f "$key"
```

Docker builds just `COPY . .` - the checked-out `paperpop/` folder is part of the build context.

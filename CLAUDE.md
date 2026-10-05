<!-- Made by Jack (iamjustjack.de) -->
# Paper Pop - notes for Claude

React component library (torn paper, pastels, polaroids) used as a git submodule (`paperpop/`) in Jack's sites.

- Components: `src/components/<category>.tsx`, styles: `src/styles/<category>.css`, exported via `src/index.ts` / `src/styles.css`.
- Every component has a story in `stories/<category>.stories.tsx`; the story drives the gallery, the screenshot/GIF and the doc page.
- Conventions and the full checklist: `docs/guides/contributing.md`. Props need one-line JSDoc with `@default`, single-line types.
- Generated, never edit by hand: `docs/components/`, `docs/media/`, `docs/components.json`, the COMPONENTS block in `README.md`.
  CI (`.github/workflows/docs.yml`, self-hosted runner) regenerates them on push. Locally: `npm run docs:meta` (no images) or `npm run docs -- --only=Name`.
- Check before committing: `npm run typecheck`; visual check in the gallery (`npm run dev`, port 5190).
- UI copy German, code/comments/commits English. No en/em dashes anywhere - use "-".
- `mcp/server.mjs` must stay dependency-free (sites run it straight from the submodule without `npm install`). `mcp/http.mjs` serves the same tools at paperpop.iamjustjack.de/mcp (nginx proxies to it, see `docker/`).

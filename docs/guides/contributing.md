<!-- Made by Jack (iamjustjack.de) -->
# Adding or changing a component

Everything generic belongs in Paper Pop, not in a site. If a site needs something new that another site could use too, build it here.

1. **Component** - add it to the matching category file in `src/components/<category>.tsx`
   (foundations, buttons, forms, feedback, navigation, layout, dashboard, landing, forum, apps).
   - `export function Name(...)` plus `export interface NameProps`.
   - Every prop gets a one-line JSDoc comment; defaults as `@default value`. Keep prop types on one line -
     the docs generator reads them.
   - Spread `...rest` onto the root element and merge `className`/`style`.
   - Class names start with `pp-`, colours come from tokens (`var(--pp-pink)`, `pp-c-<color>` sets `--c`/`--c2`).
   - Respect `prefers-reduced-motion` (global CSS already disables animations; JS effects check `reducedMotion()`).
   - German UI copy by default (labels, aria-labels), English code and comments.
2. **Styles** - `src/styles/<category>.css`. New files must be imported in `src/styles.css`.
3. **Export** - new category files are re-exported from `src/index.ts`.
4. **Story** - add a `story({...})` to `stories/<category>.stories.tsx`:
   - `description` (one sentence, English), optional `notes` (markdown), `exports` when several components share a page.
   - `example` is copied into the docs verbatim. Keep it self-contained; use `function Example() {}` when it needs state.
   - Moving component? Add `animation` - `{ duration }` for things that animate on their own, or `steps`
     (`hover`, `leave`, `click`, `focus`, `type`, `wait`) to record an interaction. The docs then get a GIF.
   - Fixed-position UI (modals, drawers, toasts) needs `viewport: { width, height }`.
5. **Check** - `npm run typecheck`, `npm run dev` (gallery on :5190), optionally `npm run docs -- --only=Name`.
6. **Push** - the `Docs` workflow regenerates `docs/`, the README gallery and `docs/components.json`
   on the self-hosted runner and commits them. Don't hand-edit generated files.

Commit messages in English, one topic per commit.

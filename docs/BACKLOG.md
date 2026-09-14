# Becket backlog — usable kit + publish

Phased work to make Becket a **curated, installable** design system.

- Thesis / API: [ABOUT.md](./ABOUT.md)
- Positioning (small projects, compile-time vs Tailwind, JS bar): [WHY.md](./WHY.md)
- npm / GitHub release steps: [PUBLISH.md](./PUBLISH.md)

**Locked**

- Packages: `@becket-ui/react` + `@becket-ui/tokens`
- First public version: **0.1.0** (not 1.0.0)
- Stay on **Panda v1**. Static CSS is the primary consumer path. Also ship a preset.
- No Zag / Ark / Chakra v3 machines
- v1 kit: current primitives + the Phase B list. No charts or date pickers.
- **ICP:** small/mid React apps that need a UI this week, including dogfood. Not “beat Tailwind at utilities.”
- **JS bar:** no JS for styling; JS only for behavior the platform does not give you. Do **not** fold Panda `css()` with a consumer bundler plugin (kills “import CSS and go”).
- **Publish gate:** G0 (pack) is met. G1 (kit + C4 SSR + public `becket-ui`) is required before `npm publish` unless PO waives for a tagged preview. See [PUBLISH.md](./PUBLISH.md).

**Status today (2026-09-07):** Phase A packaging + preset + Field + Phase B forms/overlays (except Radio) are in-repo. `pnpm pack:check` is green. `npm install @becket-ui/react` from the public registry still waits on G1 / Phase D.

CSS budget snapshot (C5 — record, no CI limit yet):

- 2026-09-07 (Panda 1.0.1, Phase B kit except Radio): `index.css` ~77 KB raw / ~11.3 KB gzip
- 2026-09-10 (Panda 1.12.1, same kit): `index.css` 76.4 KB raw / 11.2 KB gzip / 9.2 KB brotli (+0.4% gzip vs 1.0.1 on this tree — under the 20% fail bar)

---

## Phase A — publishable now

Make both packages installable from npm without adding components.

### A1. Tokens tarball includes generated artifacts

**Problem:** `styled-system/` is gitignored and there is no `files` whitelist, so npm pack drops recipes/css/jsx. Only `index.css` is likely to ship.

**Do**

- Add `files` on `@becket-ui/tokens` that includes `styled-system/**`, `index.css`, `index.mjs`, `index.d.ts`, and the future preset
- Confirm `prepare` still runs `panda codegen && panda cssgen && node scripts/bundle-css.mjs`
- Set `"sideEffects": ["*.css"]`

**Acceptance criteria**

- [x] `pnpm pack:check` lists `styled-system/recipes`, `styled-system/css`, `index.css` (and `dist/preset`)
- [ ] A throwaway app can `import { button } from '@becket-ui/tokens/recipes'` from the packed tarball (manual; CI asserts the file list)

### A2. Build `@becket-ui/react`

**Problem:** `main` / `exports` point at `src/index.ts`. Most consumer bundlers do not transpile `node_modules`.

**Do**

- Add tsup: ESM + `.d.ts`, `external: ['react', 'react-dom', '@becket-ui/tokens']`
- Point `exports` at `dist/`; `files: ["dist"]`; `sideEffects: false`
- Add a `build` script; wire it into root Turbo `build`

**Acceptance criteria**

- [x] `pnpm --filter @becket-ui/react build` emits `dist/index.js` + `dist/index.d.ts`
- [x] Packed tarball contains `dist/` only (no tests, no `.tsx` sources)
- [x] Storybook still runs against workspace source (`src/`); documented in README

### A3. Package metadata and versions

**Do**

- Align both packages at **0.1.0**
- Replace `@becket-ui/tokens` peer `workspace:*` with a semver range (`^0.1.0`)
- Peer `react` / `react-dom`: `>=19`
- Add `LICENSE` (MIT) at repo root; set `"license": "MIT"` on both packages (today: README MIT, package.json ISC)
- Add `repository`, `homepage`, `bugs`, `publishConfig.access: public`, keywords, author
- Keep the `@becket-ui` npm scope

**Acceptance criteria**

- [x] `peerDependencies` use semver (`@becket-ui/tokens` `^0.1.0`, `react`/`react-dom` `>=19`)
- [x] LICENSE file exists (MIT) and matches `package.json`
- [x] Both packages share the same 0.1.0 baseline before first publish

### A4. `"use client"` on interactive leaves

Next App Router treats modules without the directive as Server Components.

**Mark client (minimum)**

- `Switch` — `useState`
- `Card` — `useContext`
- `Field` / `TextField` — `useContext` / `useId` (may be over-marked for RSC; prove in C4)
- `Tooltip` — portal + effects
- Any later overlay that uses state (Dialog, Menu, Tabs) — when added

Layout/type/Button stay server-safe (no directive).

**Acceptance criteria**

- [ ] A Next App Router page can import `Button`, `Stack`, `Heading` in a Server Component (prove in C4)
- [ ] Importing `Switch` / `Card` / `Tooltip` into a Server Component does not throw (directive on the leaf; prove in C4)
- [x] Client boundary is not on the barrel — unbundled `dist/` keeps `"use client"` on Switch, Card, Field, TextField, Tooltip (not on Button/Stack/Heading)

### A5. Changesets + CI dry-run

**Do**

- Add Changesets (`access: public`, `baseBranch` = default branch)
- GitHub Action: install, build, typecheck, test (even if only helper tests exist), `pack --dry-run` on both packages
- Do **not** auto-publish until Phase D

**Acceptance criteria**

- [x] CI runs `pnpm pack:check` (fails if tokens tarball is missing `styled-system` or react tarball is missing `dist`)
- [x] `pnpm changeset` is the documented way to bump versions

### A6. Consumer install doc

Update [README.md](../README.md) (and this file’s “How to verify”) with:

```bash
pnpm add @becket-ui/react @becket-ui/tokens
```

```ts
import '@becket-ui/tokens/index.css';
import { Button } from '@becket-ui/react';
```

```html
<html data-theme="dark">
```

**Acceptance criteria**

- [x] README states packages are unpublished until Phase D / G1, and shows the intended install
- [x] README links to ABOUT, WHY, this backlog, and PUBLISH

**Phase A done when:** a clean machine can install packed tarballs (or a private dry-run publish) and render Button + Stack with CSS, no Vite aliases.

---

## Phase B — curated v1 kit

Add the missing primitives. Native HTML first. Recipe in tokens, then React, then stories.

Shared Field (label / helper / error / `invalid`) should exist before or with Select/Textarea so TextField can adopt it.

### Semantic tokens

Promote flat aliases (`primary`, `text`, `background`, …) to Panda `semanticTokens` with `_light` / `_dark` values. Keep `data-theme` on `<html>`. Reduce per-recipe `_light` forks.

**Acceptance criteria**

- [ ] Switching `data-theme` changes surface/text/border without a JS theme provider
- [ ] Existing Button / Card / Tag visuals match current dark + light stories

### Components to add

| Component | Approach | AC (all of these) |
| --- | --- | --- |
| **Checkbox** | Native `<input type="checkbox">` + recipe | [x] Keyboard Space; `label`/`htmlFor`; controlled + uncontrolled; sizes; stories |
| **Radio** | Native radio + `RadioGroup` | [ ] One tab stop; arrow keys; `name` grouping; stories |
| **Select** | Styled native `<select>` + Field | [x] Works without JS; `invalid` via Field; stories |
| **Textarea** | Native `<textarea>` + Field | [x] Resize vertical; disabled/invalid; stories |
| **Link** | `<a>` default, `as` allowed | [x] Focus ring; visited optional; stories |
| **Separator** | `<hr>` + recipe | [x] `orientation`; decorative `aria-hidden`; stories |
| **Spinner** | Pure CSS | [x] `size`; `aria-label` / `role="status"`; stories |
| **Table** | Slot recipe (`Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`) | [x] Semantic table markup; stories |
| **Tabs** | Minimal state + ARIA tabs | [x] Keyboard arrows; selected panel; stories |
| **Dialog** | Native `<dialog>` + recipe | [x] `showModal`; Escape; focus return; `aria-labelledby`; stories |
| **Drawer** | Same as Dialog, `placement` start/end | [x] Same a11y as Dialog; stories |
| **Menu** | `<details>` first + small keyboard JS | [x] Escape; arrows; stories |

**Acceptance criteria (kit)**

- [x] Every new component is exported from `packages/react/src/index.ts` (Radio still open)
- [x] Every new component has colocated stories with variant controls (Radio still open)
- [x] No Magnum Opus / trading names in public exports
- [x] Interactive new components have `"use client"` if they use state/effects
- [ ] Magnum Opus can compose these without new one-off CSS for forms/overlays/tables

**Field** (not a Chakra clone — a composition primitive):

- [x] Field slots (`Field`, `FieldLabel`, `FieldHelper`, `FieldError`, `FieldControl`) + `useField`
- [x] TextField composes Field (`invalid` → `aria-invalid` + error id)
- [x] Select and Textarea share the same Field wiring (`FieldSelect`, `FieldTextarea`)

**Tooltip:** leave the current portal implementation. Do not rewrite on Zag.

**Acceptance criteria (kit)**

- [ ] Every new component is exported from `packages/react/src/index.ts`
- [ ] Every new component has colocated stories with variant controls
- [ ] No Magnum Opus / trading names in public exports
- [ ] Interactive new components have `"use client"` if they use state/effects
- [ ] Magnum Opus can compose these without new one-off CSS for forms/overlays/tables

**Explicitly out of v1:** accordion, combobox, toast, slider, pagination, tree, date picker, color picker, charts.

---

## Phase C — quality bar

### C1. Tests

- Wire Testing Library in `@becket-ui/react` (Vitest already runs; `helpers/responsive.test.ts` passes in CI)
- Cover: responsive helpers, Field a11y ids, Switch controlled/uncontrolled, Dialog open/close + Escape, Checkbox keyboard

**Acceptance criteria**

- [x] `pnpm --filter @becket-ui/react test` runs in CI (helper tests only today)
- [ ] Testing Library coverage for Field / Switch / Dialog / Checkbox as those land
- [ ] Root `pnpm test` (or Turbo `test`) is not a no-op

### C2. Lint

- Add Biome **or** ESLint (pick one; root `pnpm lint` currently has no package scripts)
- Keep Prettier or let Biome own format — do not run both on the same files

**Acceptance criteria**

- [ ] `pnpm lint` fails on unused exports / obvious a11y JSX issues we enable

### C3. Storybook a11y

- Add `@storybook/addon-a11y` to `apps/docs`
- Manual pass: keyboard + focus ring + contrast on every Phase B control

**Acceptance criteria**

- [x] Addon is enabled (`@storybook/addon-a11y` in `apps/docs/.storybook/main.ts`, Storybook 10)
- [ ] Default stories do not ship known critical violations we can fix

### C4. Next.js SSR example

Add `apps/next-example` (App Router) that depends on **built** packages (or packed tarballs), not raw `src/`.

**Acceptance criteria**

- [ ] Server page renders Button, Stack, Heading, Card content
- [ ] Client island uses Switch / Dialog
- [ ] View-source / disable-JS: layout + type + buttons still styled (CSS present)
- [ ] No FOUC from missing `index.css`

### C5. Size / CSS budget

- Add a size-limit (or equivalent) on `@becket-ui/react` dist and `@becket-ui/tokens/index.css`
- Revisit Panda `staticCss` if the CSS file grows past a budget you set when measuring Phase B

**Baseline (2026-09-07, Phase B kit except Radio, Panda 1.0.1):** `index.css` ~77 KB raw / ~11.3 KB gzip.

**Remeasure (2026-09-10, Panda 1.12.1, TypeScript 7.0.2):** `index.css` 76.4 KB raw / 11.2 KB gzip / 9.2 KB brotli. Gzip moved +0.4% vs 1.0.1 on the same kit (well under a 20% jump). `staticCss` gridTemplateColumns (1–4 cols + auto-fit) and gap lists still emit, including `sm`/`md`/`lg` variants.

**Acceptance criteria**

- [ ] CI fails on unexpected JS/CSS jumps
- [x] Document the budget numbers in this file when first measured (baseline above; no CI gate yet)

---

## Phase D — first public release

Steps, accounts, and verify commands: **[PUBLISH.md](./PUBLISH.md)**. Do not `npm publish` until G1 (kit + C4 + public repo) unless PO waives for a tagged preview.

### D0. Public GitHub repo

- Private SoT stays [kolmenadev/becket](https://github.com/kolmenadev/becket)
- Create **public** [kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui) under the same org
- Push a publishable tree there (or mirror). CI/publish run from the public repo if provenance requires a public remote
- Package `repository` / `homepage` / `bugs` already target `becket-ui`

**Acceptance criteria**

- [ ] `https://github.com/kolmenadev/becket-ui` exists and is public
- [ ] A clone without GitHub auth can read README + source
- [ ] npm `repository` URLs resolve (no 404)

### D1. Publish 0.1.0

- Changesets version PR
- Publish **tokens first**, then react
- `npm publish --access public` (provenance when the npm org + CI OIDC are ready)
- Git tags on the **public** repo

**Acceptance criteria**

- [ ] `pnpm add @becket-ui/react @becket-ui/tokens` works on a machine that is not this monorepo
- [ ] Magnum Opus can switch from `file:` to the published range without Vite aliases
- [ ] `npm pack` contents match Phase A checks

### D2. Docs surface

- README install is the real registry command (remove “unpublished” caveat)
- Optional: host Storybook (Chromatic already in docs deps, unused)
- Optional: Confluence hub page under SD that points at ABOUT + this backlog (do not duplicate the whole catalog)

**Acceptance criteria**

- [ ] A new consumer can go from README → working Button in < 5 minutes
- [ ] Changelog exists (Changesets)

---

## Panda consumer path (do with A or B, not after D)

Official guide: [Using Panda in a Component Library](https://panda-css.com/docs/guides/component-library).

v1 ship shape:

1. **Primary:** prebuilt `index.css` — apps that do not run Panda
2. **Also:** `definePreset` at `@becket-ui/tokens/preset` — apps that do
3. **Not v1:** requiring consumer `include` of library src, or Panda v2 `panda lib` / build-info

**Acceptance criteria**

- [x] Preset exports the same tokens, recipes, and conditions; `BECKET_PREFIX` is `beckui-` (prefix is config-level in Panda, not a preset field)
- [ ] A Panda app can `presets: [becketPreset]` and extend `colors.primary` (documented in README; prove in a consumer when convenient)
- [x] Default (no-Panda) consumers never need `panda.config.ts`

---

## How to verify (as items land)

```bash
pnpm install
pnpm build
pnpm test
pnpm pack:check
pnpm --filter docs storybook
```

After C1: `pnpm --filter @becket-ui/react test`

After D1: install from npm in a fresh Vite or Next app; import CSS; render `<Button>`.

---

## Suggested order

1. Phase B forms (Checkbox, then Field-wired Select/Textarea) — unblocks dogfood
2. Overlays (Dialog, Drawer, Menu) then Table / Tabs / Spinner / Link / Separator
3. Semantic tokens can land in parallel with B
4. **C4 Next example** — SSR gate before calling 0.1.0 solid
5. D0 public `becket-ui` + npm org
6. D1 publish tokens then react ([PUBLISH.md](./PUBLISH.md))
7. C1 RTL tests / C2 lint / C5 size-limit CI in the same window as 6
8. Do **not** start absolute-zero styling JS or Zag/Ark

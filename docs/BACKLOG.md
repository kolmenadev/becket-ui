# Becket backlog — usable kit + publish

Phased work to make Becket a **curated, installable** design system.

- Thesis / API: [ABOUT.md](./ABOUT.md)
- Positioning (small projects, compile-time vs Tailwind, JS bar): [WHY.md](./WHY.md)
- npm / GitHub release steps: [PUBLISH.md](./PUBLISH.md)
- Consumer MCP (AI agents): [MCP.md](./MCP.md) — [MAV-36](https://kolmena.atlassian.net/browse/MAV-36); **not** a 0.1.0 gate
- Figma library: [FIGMA.md](./FIGMA.md) — [MAV-49](https://kolmena.atlassian.net/browse/MAV-49); **not** a 0.1.0 gate

**Locked**

- Packages: `@becket-ui/react` + `@becket-ui/tokens`
- First public version: **0.1.0** (not 1.0.0)
- Stay on **Panda v1**. Static CSS is the primary consumer path. Also ship a preset.
- No Zag / Ark / Chakra v3 machines
- v1 kit: current primitives + the Phase B list. No charts or date pickers.
- **ICP:** small/mid React apps that need a UI this week, including dogfood. Not “beat Tailwind at utilities.”
- **JS bar:** no JS for styling; JS only for behavior the platform does not give you. Do **not** fold Panda `css()` with a consumer bundler plugin (kills “import CSS and go”).
- **Publish gate:** G0 (pack) is met. G1 (kit + C4 SSR + public `becket-ui` + **consumer theming MAV-22–28 and MAV-5** + **WCAG 2.2 AA [MAV-29](https://kolmena.atlassian.net/browse/MAV-29)** + **a11y test gate [MAV-45](https://kolmena.atlassian.net/browse/MAV-45)**) is required before `npm publish` unless PO waives for a tagged preview. See [PUBLISH.md](./PUBLISH.md).

**Status today (2026-09-14):** Phase A packaging + preset + Field + Phase B forms/overlays (including Radio) are in-repo. C4 Next example is in-repo. `pnpm pack:check` is green. `npm install @becket-ui/react` from the public registry still waits on G1 (public GitHub + **theming MAV-22–28 / MAV-5** + **a11y MAV-29** + **a11y tests MAV-45**).

CSS budget snapshot (C5 — record, no CI limit yet):

- 2026-09-07 (Panda 1.0.1, Phase B kit except Radio): `index.css` ~77 KB raw / ~11.3 KB gzip
- 2026-09-10 (Panda 1.12.1, same kit): `index.css` 76.4 KB raw / 11.2 KB gzip / 9.2 KB brotli (+0.4% gzip vs 1.0.1 on this tree — under the 20% fail bar)
- 2026-09-14 (Panda 1.12.1, kit including Radio): `index.css` 82.8 KB raw / 11.6 KB gzip (+3.6% gzip vs 2026-09-10 — under the 20% fail bar)

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

- [x] A Next App Router page can import `Button`, `Stack`, `Heading` in a Server Component (prove in C4)
- [x] Importing `Switch` / `Card` / `Tooltip` into a Server Component does not throw (directive on the leaf; prove in C4)
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

- [x] Switching `data-theme` changes surface/text/border without a JS theme provider
- [x] Existing Button / Card / Tag visuals match current dark + light stories

### Components to add

| Component | Approach | AC (all of these) |
| --- | --- | --- |
| **Checkbox** | Native `<input type="checkbox">` + recipe | [x] Keyboard Space; `label`/`htmlFor`; controlled + uncontrolled; sizes; stories |
| **Radio** | Native radio + `RadioGroup` | [x] One tab stop; arrow keys; `name` grouping; stories |
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

- [x] Every new component is exported from `packages/react/src/index.ts`
- [x] Every new component has colocated stories with variant controls
- [x] No consumer-product names in public exports
- [x] Interactive new components have `"use client"` if they use state/effects
- [ ] A consuming app can compose these without new one-off CSS for forms/overlays/tables

**Field** (not a Chakra clone — a composition primitive):

- [x] Field slots (`Field`, `FieldLabel`, `FieldHelper`, `FieldError`, `FieldControl`) + `useField`
- [x] TextField composes Field (`invalid` → `aria-invalid` + error id)
- [x] Select and Textarea share the same Field wiring (`FieldSelect`, `FieldTextarea`)

**Tooltip:** leave the current portal implementation. Do not rewrite on Zag.

**Acceptance criteria (kit)**

- [x] Every new component is exported from `packages/react/src/index.ts`
- [x] Every new component has colocated stories with variant controls
- [x] No consumer-product names in public exports
- [x] Interactive new components have `"use client"` if they use state/effects
- [ ] A consuming app can compose these without new one-off CSS for forms/overlays/tables

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

Full WCAG 2.2 AA bar (**G1 / 0.1.0 required**, PO 2026-09-14): fix epic [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) + test epic [MAV-45](https://kolmena.atlassian.net/browse/MAV-45). C3 stays the Storybook addon floor (local only; not Playwright/Chromatic CI).

### C4. Next.js SSR example

Add `apps/next-example` (App Router) that depends on **built** packages (or packed tarballs), not raw `src/`.

**Acceptance criteria**

- [x] Server page renders Button, Stack, Heading, Card content
- [x] Client island uses Switch / Dialog
- [x] View-source / disable-JS: layout + type + buttons still styled (CSS present)
- [x] No FOUC from missing `index.css`

### C5. Size / CSS budget

- Add a size-limit (or equivalent) on `@becket-ui/react` dist and `@becket-ui/tokens/index.css`
- Revisit Panda `staticCss` if the CSS file grows past a budget you set when measuring Phase B

**Baseline (2026-09-07, Phase B kit except Radio, Panda 1.0.1):** `index.css` ~77 KB raw / ~11.3 KB gzip.

**Remeasure (2026-09-10, Panda 1.12.1, TypeScript 7.0.2):** `index.css` 76.4 KB raw / 11.2 KB gzip / 9.2 KB brotli. Gzip moved +0.4% vs 1.0.1 on the same kit (well under a 20% jump). `staticCss` gridTemplateColumns (1–4 cols + auto-fit) and gap lists still emit, including `sm`/`md`/`lg` variants.

**Acceptance criteria**

- [ ] CI fails on unexpected JS/CSS jumps
- [x] Document the budget numbers in this file when first measured (baseline above; no CI gate yet)

### C6. WCAG 2.2 AA for shipped primitives — [MAV-29](https://kolmena.atlassian.net/browse/MAV-29)

Audit 2026-09-14: native HTML + `showModal()` was not enough. **Children Done in-repo 2026-09-14.** Contrast / 24×24 / focus rings stay Storybook + C3. **G1 / 0.1.0 required** (PO 2026-09-14).

| Work | Ticket | Severity | Status |
| --- | --- | --- | --- |
| Tooltip: no extra tab stop / nested interactive | [MAV-30](https://kolmena.atlassian.net/browse/MAV-30) | Critical | **Done in-repo** |
| Field: `aria-describedby` only when helper/error exists | [MAV-31](https://kolmena.atlassian.net/browse/MAV-31) | Critical | **Done in-repo** |
| Dialog + Drawer APG (name, description, alertdialog) | [MAV-32](https://kolmena.atlassian.net/browse/MAV-32) | High | **Done in-repo** |
| Button default `type="button"` | [MAV-33](https://kolmena.atlassian.net/browse/MAV-33) | High | **Done in-repo** |
| Menu, Tabs, Switch leftover APG | [MAV-35](https://kolmena.atlassian.net/browse/MAV-35) | Medium | **Done in-repo** |

**Bar:** WCAG 2.2 AA + APG for Dialog, Drawer, Menu, Tabs, Tooltip, Switch. Not AAA.

**OK already:** native checkbox/radio/select/textarea/table; Dialog `showModal` trap + Escape; Tabs roving tabindex.

**Acceptance criteria**

- [x] All MAV-29 children Done or PO-waived
- [x] Default overlay/form/disclosure **renders**: no axe critical/serious in Vitest (`src/a11y.defaults.test.tsx`). Color-contrast / 24×24 stay Storybook + C3.
- [x] README does not say WCAG/accessible until then (still true for npm marketing copy; contrast/target-size are not jsdom-proven)
- [x] CI axe gate is [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) / [MAV-34](https://kolmena.atlassian.net/browse/MAV-34) (Vitest; not this epic’s children)

### C7. A11y test gate — [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) — **G1 / 0.1.0 required**

PO 2026-09-14: maintain WCAG 2.2 AA with **automated tests**. No Playwright. No Chromatic. Do not invent a WCAG engine.

**Chosen:** axe-core in **Vitest + jsdom** + Testing Library. Thin private helper `@becket-ui/a11y` (`packages/a11y`, `private: true`, not npm-published in 0.1.0). Keyboard/APG via `user-event`. Storybook `@storybook/addon-a11y` stays **local**. Lint a11y (Biome or jsx-a11y) when [MAV-9](https://kolmena.atlassian.net/browse/MAV-9) lands — static only.

**jsdom cannot prove** color-contrast, 24×24 hit targets, or painted focus rings. Disable those axe rules in CI; keep them on the Storybook addon + C3 manual pass.

| Work | Ticket | Status |
| --- | --- | --- |
| Private axe-core helper | [MAV-46](https://kolmena.atlassian.net/browse/MAV-46) | **Done in-repo** |
| CI axe on Default primitive renders | [MAV-34](https://kolmena.atlassian.net/browse/MAV-34) | **Done in-repo** |
| Keyboard APG tests | [MAV-47](https://kolmena.atlassian.net/browse/MAV-47) | **Done in-repo** |
| Authoring: every interactive primitive ships an a11y test | [MAV-48](https://kolmena.atlassian.net/browse/MAV-48) | **Done** |

**Out:** Storybook test-runner, Playwright, Chromatic, Cypress, Pa11y, Lighthouse-CI, public `@becket-ui/a11y` on npm.

**Acceptance criteria**

- [x] `pnpm test` fails on axe critical/serious for Default interactive primitives
- [x] Helper is private / not a 0.1.0 publish artifact
- [x] New interactive primitives cannot land without an axe test (guidelines)

---

## Phase D — first public release

Steps, accounts, and verify commands: **[PUBLISH.md](./PUBLISH.md)**. Do not `npm publish` until G1 (kit + C4 + public repo + theming MAV-22–28 / MAV-5 + **a11y MAV-29** + **a11y tests MAV-45**) unless PO waives for a tagged preview.

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
- [ ] A consuming app can switch from `file:` to the published range without Vite aliases
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

## Phase E — consumer theming (no Panda) — MAV-22 — **G1 / 0.1.0 required**

PO locked 2026-09-14: **do not publish 0.1.0 until every ticket in this table is Done.** Companies rebrand with CSS variables after `index.css`. No theme provider. Panda preset stays optional.

Spec: Confluence [Consumer theming](https://kolmena.atlassian.net/wiki/spaces/BU/pages/146898954/Consumer+theming). Epic: [MAV-22](https://kolmena.atlassian.net/browse/MAV-22).

| Work | Ticket | Status |
| --- | --- | --- |
| Public CSS variable contract + `theme.example.css` | [MAV-23](https://kolmena.atlassian.net/browse/MAV-23) | Done |
| Alias graph: `primary` → hover + gradients | [MAV-24](https://kolmena.atlassian.net/browse/MAV-24) | Done |
| Semantic tokens (prerequisite, also G1) | [MAV-5](https://kolmena.atlassian.net/browse/MAV-5) | Done |
| `defineBecketTheme()` emits CSS | [MAV-25](https://kolmena.atlassian.net/browse/MAV-25) | Done |
| Component density CSS vars (Button/Field) | [MAV-26](https://kolmena.atlassian.net/browse/MAV-26) | Done |
| Docs: brand theme vs instance `style`/`className` | [MAV-27](https://kolmena.atlassian.net/browse/MAV-27) | Done |
| Prove packed no-Panda app retints recipes | [MAV-28](https://kolmena.atlassian.net/browse/MAV-28) | Done |

**Acceptance (epic):** a no-Panda app overrides `primary` / radii / `sizes.field` and Button, Card, Field, focus, and gradients update; light+dark via `data-theme`; README splits brand vs instance override.

---

## Phase F — consumer MCP — MAV-36 — **not G1 / not 0.1.0**

PO locked 2026-09-14: **v1 is consumer-only** (agents implementing *with* Becket). **Does not block `npm publish`.** Local stdio in this monorepo; `npx @becket-ui/mcp` waits on G1 / [MAV-3](https://kolmena.atlassian.net/browse/MAV-3).

Spec: [MCP.md](./MCP.md). Confluence: [Consumer MCP](https://kolmena.atlassian.net/wiki/spaces/BU/pages/147456016/Consumer+MCP). Epic: [MAV-36](https://kolmena.atlassian.net/browse/MAV-36).

| Work | Ticket | v1 AC? |
| --- | --- | --- |
| Spec tool list + catalog schema | [MAV-37](https://kolmena.atlassian.net/browse/MAV-37) | Yes |
| Generate catalog from public exports | [MAV-38](https://kolmena.atlassian.net/browse/MAV-38) | Yes |
| AI-sized examples per primitive | [MAV-39](https://kolmena.atlassian.net/browse/MAV-39) | Yes |
| stdio `@becket-ui/mcp` | [MAV-40](https://kolmena.atlassian.net/browse/MAV-40) | Yes |
| `review_usage` + compositions | [MAV-41](https://kolmena.atlassian.net/browse/MAV-41) | Yes |
| Connect docs (Cursor / Claude / VS Code) | [MAV-42](https://kolmena.atlassian.net/browse/MAV-42) | Yes |
| Eval golden prompts | [MAV-43](https://kolmena.atlassian.net/browse/MAV-43) | Yes |
| Publish `@becket-ui/mcp` | [MAV-44](https://kolmena.atlassian.net/browse/MAV-44) | No (after G1) |

**Acceptance (epic):** stdio MCP exposes install, catalog, props, examples, theme, review, compositions; CI drift check vs public exports; README connect snippet; three golden prompts use Becket primitives and `data-theme`, no Chakra `Provider`. G1 checklist does not list this epic.

---

## Phase G — Figma library — MAV-49 — **not G1 / not 0.1.0**

PO locked 2026-09-14: put Becket in Figma as a published team library that **mirrors** `@becket-ui` (code is SoT). Follow Figma DS-101: groundwork → foundations → build in Figma. **Does not block `npm publish`.**

Spec: [FIGMA.md](./FIGMA.md). Confluence: [Figma library](https://kolmena.atlassian.net/wiki/spaces/BU/pages/147554313/Figma+library). Epic: [MAV-49](https://kolmena.atlassian.net/browse/MAV-49).

| Work | Ticket | v1 AC? |
| --- | --- | --- |
| Groundwork: goals, inventory, approach, principles | [MAV-50](https://kolmena.atlassian.net/browse/MAV-50) | Yes |
| Accessibility (AA, contrast, usage notes) | [MAV-51](https://kolmena.atlassian.net/browse/MAV-51) | Yes |
| Color palette (60/30/10, dark + light) | [MAV-52](https://kolmena.atlassian.net/browse/MAV-52) | Yes |
| Typography (Heading / Text) | [MAV-53](https://kolmena.atlassian.net/browse/MAV-53) | Yes |
| Elevation + icon grid | [MAV-54](https://kolmena.atlassian.net/browse/MAV-54) | Yes |
| Variables: primitive + semantic tokens | [MAV-55](https://kolmena.atlassian.net/browse/MAV-55) | Yes |
| Spatial system (spacing, layout, breakpoints) | [MAV-56](https://kolmena.atlassian.net/browse/MAV-56) | Yes |
| Components + properties for v1 kit | [MAV-57](https://kolmena.atlassian.net/browse/MAV-57) | Yes |
| Semantic naming aligned with code | [MAV-58](https://kolmena.atlassian.net/browse/MAV-58) | Yes |
| Organize and publish the team library | [MAV-59](https://kolmena.atlassian.net/browse/MAV-59) | Yes |
| Contribution + token drift | [MAV-60](https://kolmena.atlassian.net/browse/MAV-60) | No (after library exists) |

**Acceptance (epic):** Figma file has primitive + semantic variables (dark + light); v1 primitives as components with recipe-matching properties; library published; AA contrast on color styles; G1 checklist does not list this epic.

---

## How to verify (as items land)

```bash
pnpm install
pnpm build
pnpm test
pnpm pack:check
pnpm --filter docs storybook
```

After C4: `pnpm example:build && node scripts/assert-next-example.mjs`

After D1: install from npm in a fresh Vite or Next app; import CSS; render `<Button>`.

---

## Suggested order

1. **A11y G1** — [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) and [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) are **Done in-repo**. Contrast / 24×24 / focus rings stay Storybook addon + C3. Can parallel 2.
2. D0 public `becket-ui` + npm org ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). Code theming tickets are **Done**.
3. D1 publish tokens then react ([PUBLISH.md](./PUBLISH.md)) — only after **a11y MAV-29** + **tests MAV-45** + public repo
4. C1 RTL tests / C2 lint / C5 size-limit CI in the same window as 3
5. **Consumer MCP** — [MAV-36](https://kolmena.atlassian.net/browse/MAV-36); start [MAV-37](https://kolmena.atlassian.net/browse/MAV-37). Can parallel any G1 work. **Does not block publish.**
6. **Figma library** — [MAV-49](https://kolmena.atlassian.net/browse/MAV-49); start [MAV-50](https://kolmena.atlassian.net/browse/MAV-50). Can parallel any G1 work. **Does not block publish.**
7. Do **not** start absolute-zero styling JS or Zag/Ark

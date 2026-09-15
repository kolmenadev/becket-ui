# How to publish `@becket-ui/react` + `@becket-ui/tokens`

Operational checklist for **0.1.0**. Positioning: [WHY.md](./WHY.md). Product shape: [ABOUT.md](./ABOUT.md). Remaining kit work: [BACKLOG.md](./BACKLOG.md). Every version after that: [RELEASING.md](./RELEASING.md). After each `npm publish` (0.1.0 and later), run [Verify each published version](#verify-each-published-version).

**First public version is 0.1.0** (not 1.0.0). Packages are already versioned `0.1.0` in-repo. They are **not** on the public npm registry until this checklist is done.

There are two gates. Do not mix them.

| Gate | Meaning | Status (2026-09-14) |
| --- | --- | --- |
| **G0 — physically publishable** | Tarballs contain CSS + `dist` + preset; CI pack-check is green | **Met in-repo** (`pnpm pack:check`) |
| **G1 — 0.1.0 is honest** | Curated kit + Next SSR proof + public GitHub + **consumer theming** + **WCAG 2.2 AA** + **a11y CI** | **Not met** — remaining: D0 public GitHub ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). Theming + [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) + [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) are **Done in-repo**. |

Locked: **do not run `npm publish` until G1**, unless PO explicitly waives for a tagged preview (`0.1.0-next.0`). Default is wait. PO 2026-09-14: theming is **in** G1. PO 2026-09-14 (later): **WCAG 2.2 AA ([MAV-29](https://kolmena.atlassian.net/browse/MAV-29)) is in G1**. Same day: **a11y test gate ([MAV-45](https://kolmena.atlassian.net/browse/MAV-45))** is in G1 — Vitest + axe-core, **no Playwright / Chromatic**.

---

## What already exists (do not redo)

- [x] `@becket-ui/tokens` `files` includes `styled-system/**`, `index.css`, `dist/preset`
- [x] `@becket-ui/react` tsup ESM + `.d.ts`; `publishConfig` points at `dist/`
- [x] Unbundled react build so `"use client"` stays on leaves
- [x] MIT `LICENSE` at repo root and on both packages
- [x] Peers: `react` / `react-dom` `>=19`, `@becket-ui/tokens` `^0.1.0`
- [x] `publishConfig.access: public`; `repository` / `homepage` / `bugs` → **becket-ui**
- [x] Changesets (`fixed` pair, `access: public`, `baseBranch: main`)
- [x] CI: install, build, typecheck, test, `pnpm pack:check`
- [x] Panda preset at `@becket-ui/tokens/preset`

`@becket-ui/a11y` is a **private** workspace package (Vitest + axe-core). It is not an npm 0.1.0 artifact.

**Still false:** `https://github.com/kolmenadev/becket-ui` does not exist. npm install of `@becket-ui/react` does not work on a clean machine.

---

## G1 — before the first public 0.1.0

Treat this as the “solid preview kit” bar. AC is testable.

### Product (Phase B)

- [x] v1 primitives shipped: Checkbox, Radio, Select, Textarea, Link, Separator, Spinner, Table, Tabs, Dialog, Drawer, Menu (see [BACKLOG.md](./BACKLOG.md) Phase B)
- [x] Select + Textarea use Field (`invalid` + error id)
- [x] No consumer-product names in public exports
- [x] Native HTML first; no Zag / Ark / Chakra v3 machines

### Quality (Phase C — minimum for G1)

- [x] **C4** `apps/next-example`: App Router consumes **packed tarballs** (not `src/`) — this is distribution dogfood; Magnum Opus is product dogfood and stays on `file:` / vendor until G1
  - Server page: Button, Stack, Heading, Card content
  - Client island: Switch (Dialog when it exists)
  - View-source / JS disabled: layout + type + buttons still styled
  - No FOUC from missing `index.css`
- [x] **C6 WCAG 2.2 AA** epic [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) **Done** (all children). Required for 0.1.0. Contrast / 24×24 / focus rings stay Storybook + C3 (jsdom cannot prove them).
- [x] **C7 a11y tests** epic [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) **Done** (Vitest + axe; no Playwright/Chromatic). Required for 0.1.0.
- [x] **C5** gzip/brotli of `index.css` recorded in [BACKLOG.md](./BACKLOG.md) (latest 2026-09-14: 82.8 KB raw / 11.6 KB gzip). CI size-limit still trails ([MAV-11](https://kolmena.atlassian.net/browse/MAV-11)).
- [ ] C1/C2 / C5 CI size-limit can trail a preview publish if PO waives; **C4, C6, and C7 cannot**

### Theming (Phase E — **required for 0.1.0**, PO 2026-09-14)

Do not publish until **all** of these are Done. Spec: [BACKLOG.md](./BACKLOG.md) Phase E.

- [x] [MAV-24](https://kolmena.atlassian.net/browse/MAV-24) alias graph — override `primary` retints hover + gradients
- [x] [MAV-23](https://kolmena.atlassian.net/browse/MAV-23) public CSS variable contract + example theme file
- [x] [MAV-5](https://kolmena.atlassian.net/browse/MAV-5) semantic tokens (light/dark one-file)
- [x] [MAV-28](https://kolmena.atlassian.net/browse/MAV-28) packed no-Panda app retints recipes
- [x] [MAV-25](https://kolmena.atlassian.net/browse/MAV-25) `defineBecketTheme()` emits CSS (no Panda in the consumer)
- [x] [MAV-26](https://kolmena.atlassian.net/browse/MAV-26) component density CSS vars (Button/Field, not Stack gap)
- [x] [MAV-27](https://kolmena.atlassian.net/browse/MAV-27) docs: brand theme vs instance `className`/`style`
- [x] Epic [MAV-22](https://kolmena.atlassian.net/browse/MAV-22) Done when the seven above are Done

### Remotes (Phase D0)

Policy (README voice, Turbo stays, **verify before every public push**, history): [REMOTES.md](./REMOTES.md).

- [x] Public repo **kolmenadev/becket-ui** exists
- [ ] Clone without GitHub auth shows a **consumer** README + source (not the monorepo/Turbo landing page)
- [x] npm `repository` URLs resolve (no 404)

---

## D0 — create the public GitHub repo

Private SoT stays [kolmenadev/becket](https://github.com/kolmenadev/becket). npm metadata already points at **becket-ui** so consumers never hit a private URL. How the two remotes work: [REMOTES.md](./REMOTES.md).

1. Under org `kolmenadev`, create public repo `becket-ui` (MIT). **Done.**
2. Push a publishable tree (mirror of `main`, not a second clone). **CI and `npm publish` should run from the public repo** if you want npm provenance (OIDC needs a public remote). First mirror landed; later updates need an explicit public push (do not auto-sync).
3. Confirm `https://github.com/kolmenadev/becket-ui` loads logged-out with the **consumer** root README.
4. Default: **private SoT + public mirror** until dual remotes are a burden. Documented in [REMOTES.md](./REMOTES.md), not by keeping an internal README on `main`.

**AC**

- [ ] Logged-out GitHub user can read a consumer README (install CSS + Button; no Turbo-first)
- [x] `repository` fields in both `package.json` files resolve

---

## Accounts and access (do once)

Kolmena’s npm org for this library is **`becket-ui`**. Creating that org **claims the `@becket-ui` scope**. Do not invent a custom runbook — npm already documents it:

- [Creating an organization](https://docs.npmjs.com/creating-an-organization) — org name **is** the scope (`becket-ui` → `@becket-ui`). Use the free “Unlimited public packages” plan.
- [About organization scopes and packages](https://docs.npmjs.com/about-organization-scopes-and-packages)
- [Creating and publishing an organization scoped package](https://docs.npmjs.com/creating-and-publishing-an-organization-scoped-package/) — `npm publish --access public`

1. **Create npm org `becket-ui`.** On [npmjs.com](https://www.npmjs.com), profile menu → **Add an Organization** → name `becket-ui`. Packages are `@becket-ui/react` and `@becket-ui/tokens`. Checked 2026-09-14: neither package exists on the registry yet (404). Unscoped `becket` **is** taken (unrelated CLI at [becket.dev](https://becket.dev)) — do **not** create org `becket`.
2. **2FA** on the publishing npm user.
3. **`NPM_TOKEN`** (automation) or GitHub Actions **OIDC provenance** (`id-token: write` + npm trusted publisher). First publish may be a manual `npm publish` from a clean checkout of `becket-ui`.
4. Org members: at least one other Kolmena owner so the scope is not a single-person bus factor.

A company org named `kolmena` would claim `@kolmena/*`. That is a **separate** org and **out of scope for 0.1.0**. Scope is locked `@becket-ui`.

---

## D1 — publish 0.1.0

Run from a **clean clone of the public repo** (or the private SoT if that is the chosen publish remote). Do not publish from a dirty worktree with unpublished experiments.

```bash
pnpm install
pnpm build
pnpm --filter @becket-ui/react exec tsc --noEmit -p tsconfig.build.json
pnpm --filter @becket-ui/react test
pnpm pack:check
```

Manual smoke is **gate 1** in [Verify each published version](#verify-each-published-version) (`pnpm pack:check`, `pnpm example:build`, `assert-next-example`, eyeball `:3002`). Do not invent a second throwaway app — `apps/next-example` is that consumer.

### Version

Both packages are already `0.1.0`. If you published nothing yet:

- Either publish that version as-is, **or**
- Add a changeset, run `pnpm changeset version`, commit the changelog, then publish.

Do not skip the changelog after the first publish. Changesets is the bump path (README).

### Order

**Tokens first, then react.** React peers `@becket-ui/tokens` `^0.1.0`. If react lands first, install fails for everyone.

```bash
# authenticated to npm, from packages/tokens then packages/react
# or from root with a changeset publish script when you add one
cd packages/tokens && npm publish --access public
cd packages/react && npm publish --access public
```

Prefer `pnpm changeset publish` once CI OIDC is wired so versions and tags stay in lockstep (`fixed` pair in `.changeset/config.json`).

### Tags

- Git tag `v0.1.0` on **becket-ui** (the public remote).
- npm dist-tag `latest`.

### After publish — verify

Run **all three gates** in [Verify each published version](#verify-each-published-version). First public cut also switches Magnum Opus from `file:` / vendor to `^0.1.0` (gate 3).

---

## Verify each published version

Do this for **0.1.0 and every later cut**. Magnum Opus with the Vite `src` alias on does **not** count — that path can look fine while `exports`, CSS, and `dist` are broken. Dogfood split: [ABOUT.md](./ABOUT.md#dogfood-two-jobs).

Three gates. Do not mix them. A version is honest only when **all three** pass.

| Gate | When | What it proves |
| --- | --- | --- |
| **1. Tarball** | Before `npm publish` (CI already on every PR) | Packed contents + Next SSR consume work. This is the publishable artifact. |
| **2. Registry** | After `npm publish`, on a machine that is **not** this monorepo | npm actually serves the packages. CI cannot see this. |
| **3. Product** | After G1 for `0.1.0`; again whenever Magnum Opus takes the bump | A real app can use the published range with **no** Vite `src` alias. |

### Gate 1 — tarball (before publish)

`pnpm pack` is what npm publishes. From the repo root of the commit you are about to ship:

```bash
pnpm pack:check
pnpm example:build
node scripts/assert-next-example.mjs
```

CI (`.github/workflows/ci.yml`) already runs these. Re-run locally if you are publishing by hand.

| Check | Pass means |
| --- | --- |
| `pack:check` | Tokens tarball has `index.css`, `styled-system`, preset, theme. React tarball has `dist/`, not `src/` / stories / tests. |
| `example:prepare` (inside `example:build`) | Next app installed **npm `file:.tgz`**, resolved `dist/`, no `panda.config`. |
| `assert-next-example` | Prerendered HTML still has recipe classes (`beckui--button`, …), `--beckui--` CSS, and a `defineBecketTheme()` primary override. |

Then **look** at `http://localhost:3002` (`pnpm example:dev`):

- [ ] View-source / JS off: layout, type, and buttons still styled
- [ ] Client island: Switch + Dialog work
- [ ] Primary is the purple theme override, not brand yellow

`apps/next-example` is the packed-tarball replica. Magnum Opus is **not** this replica.

**AC**

- [ ] `pack:check` + `example:build` + `assert-next-example` are green on the ship commit
- [ ] Eyeball pass on `:3002` for CSS / JS-off / client island / brand override

### Gate 2 — registry (after publish)

From a **new directory** — not `kolmena/maverick`, not Magnum Opus with the live alias:

```bash
pnpm add @becket-ui/react@^X.Y.Z @becket-ui/tokens@^X.Y.Z
```

```ts
import '@becket-ui/tokens/index.css';
import { Button } from '@becket-ui/react';
```

```html
<html data-theme="dark">
```

Use the version you just published (`0.1.0`, `0.1.1`, …). Failures here are registry, metadata, or `peerDependencies` — tarball CI cannot see them.

**AC**

- [ ] Install works on a clean machine
- [ ] TypeScript resolves the public entry
- [ ] One `Button` renders with Becket CSS and `data-theme`

### Gate 3 — Magnum Opus as a real consumer

Temporarily **disable** the Vite live alias (or run in Docker — no sibling `kolmena/maverick`, no alias). Point `web/package.json` at the published range, reinstall, run the dashboard.

```json
"@becket-ui/react": "^X.Y.Z",
"@becket-ui/tokens": "^X.Y.Z"
```

- First public cut: switch off `file:../vendor/becket-ui/...` to `^0.1.0`.
- Later 0.x **minors:** `^0.1.0` does **not** include `0.2.0`. Raise the range on purpose ([RELEASING.md](./RELEASING.md) caret trap).
- Keep a path override only as a *dev* HMR escape hatch. Do not restyle Magnum Opus as a throwaway Next app.

**AC**

- [ ] Same public imports; no deep `src/` imports
- [ ] Dashboard runs with the alias **off** (or in Docker)
- [ ] If it only works with `kolmena/maverick/packages/react/src` on disk, this version **failed**

A local vendor sync + HMR loop is product UX. It is not gate 1 or 2.

### What each gate does not prove

| Layer | Does not prove |
| --- | --- |
| Unit tests / Storybook | The npm tarball |
| Gate 1 (`pack:check` + Next example) | The full Magnum Opus UI |
| Gate 3 with Vite `src` alias **on** | `exports` / `dist` / registry |
| jsdom a11y | Contrast, 24×24 targets, painted focus rings (Storybook addon + C3) |

The Next example does not walk every primitive. After a release that adds or restyles a control, also check that story in Storybook.

### Per-version checklist

Copy onto the GitHub Release notes or the Version Packages PR:

- [ ] Gate 1 green on the ship commit (`pack:check`, `example:build`, `assert-next-example`, `:3002` eyeball)
- [ ] `npm publish` tokens then react (or `pnpm changeset publish`)
- [ ] Git tag `vX.Y.Z` + GitHub Release on **becket-ui** ([RELEASING.md](./RELEASING.md))
- [ ] Gate 2: clean-machine `pnpm add` at `^X.Y.Z`
- [ ] Gate 3: Magnum Opus on that range with the Vite alias **off** (or skip until this app takes the bump)
- [ ] If the version is broken: deprecate, do not unpublish ([RELEASING.md](./RELEASING.md))

---

## D2 — docs after the bits are live

- [ ] README: remove “not published yet”; install command is the real one
- [ ] Changeset changelog is on GitHub (GitHub Releases list — [RELEASING.md](./RELEASING.md))
- [ ] Optional: host Storybook (Chromatic is already in docs deps, unused)
- [ ] Optional: one Confluence BU page that **links** ABOUT + BACKLOG + WHY + this file + [RELEASING.md](./RELEASING.md) — do not duplicate the catalog or the changelog

**AC:** a new consumer goes README → working Button in under 5 minutes.

---

## What we are not doing at publish

| Out | Why |
| --- | --- |
| Absolute-zero styling JS (fold Panda `css()` in the consumer) | Small-project pitch is “no compiler in the app.” See [WHY.md](./WHY.md). |
| Zag / Ark / Chakra v3 machines | Abandons native-HTML + compile-time thesis |
| Auto-publish on every main push | CI pack-checks only until this D1 is done once by a human |
| Claiming “faster than Tailwind” or “zero JS” | Untrue; CSS is compile-time, recipe class-map still exists |
| Charts, date pickers, combobox | Explicitly out of v1 |
| Waiting on the consumer MCP ([MAV-36](https://kolmena.atlassian.net/browse/MAV-36)) | Local stdio is parallel work. **Not a G1 gate.** Publish `@becket-ui/mcp` after npm exists ([MAV-44](https://kolmena.atlassian.net/browse/MAV-44)). |
| Waiting on the Figma library ([MAV-49](https://kolmena.atlassian.net/browse/MAV-49)) | Design-system file is parallel work. **Not a G1 gate.** Code + Storybook remain SoT for 0.1.0. |

---

## Suggested sequence (engineering)

1. **A11y G1** — [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) and [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) are **Done in-repo**. Contrast / 24×24 stay Storybook + C3. Can parallel 2.
2. D0 public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). Code theming tickets are Done; public repo is the remaining theming-adjacent G1 remote.
3. npm org + first `npm publish` (tokens, then react) — **blocked on 2** (D0). Step 1 is Done in-repo.
4. [Verify each published version](#verify-each-published-version) (gates 1–3). Point Magnum Opus at `^0.1.0` with the Vite alias off. Keep a local path override only as a *dev* escape hatch. Do **not** restyle Magnum Opus as a throwaway Next app — `apps/next-example` already is the packed-tarball consumer.
5. C1 tests / C2 lint / C5 size-limit can land in the same week as 3–4
6. Consumer MCP ([MAV-36](https://kolmena.atlassian.net/browse/MAV-36)) can parallel any of the above. It does **not** block step 3.
7. Figma library ([MAV-49](https://kolmena.atlassian.net/browse/MAV-49)) can parallel any of the above. It does **not** block step 3.

**Next engineering step:** D0 public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). A11y G1 code + tests are in-repo. Do not `npm publish` until public GitHub exists. MCP is optional — start at [MAV-37](https://kolmena.atlassian.net/browse/MAV-37).

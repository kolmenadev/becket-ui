# How to publish `@becket-ui/react` + `@becket-ui/tokens`

Operational checklist. Positioning: [WHY.md](./WHY.md). Product shape: [ABOUT.md](./ABOUT.md). Remaining kit work: [BACKLOG.md](./BACKLOG.md).

**First public version is 0.1.0** (not 1.0.0). Packages are already versioned `0.1.0` in-repo. They are **not** on the public npm registry until this checklist is done.

There are two gates. Do not mix them.

| Gate | Meaning | Status (2026-09-07) |
| --- | --- | --- |
| **G0 — physically publishable** | Tarballs contain CSS + `dist` + preset; CI pack-check is green | **Met in-repo** (`pnpm pack:check`) |
| **G1 — 0.1.0 is honest** | Curated kit + Next SSR proof + public GitHub + **consumer theming** + **WCAG 2.2 AA** + **a11y CI** | **Not met** (D0 + theming + [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) + [MAV-45](https://kolmena.atlassian.net/browse/MAV-45)) |

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
- [ ] Select + Textarea use Field (`invalid` + error id)
- [ ] No consumer-product names in public exports
- [ ] Native HTML first; no Zag / Ark / Chakra v3 machines

### Quality (Phase C — minimum for G1)

- [x] **C4** `apps/next-example`: App Router consumes **packed tarballs** (not `src/`) — this is distribution dogfood; Magnum Opus is product dogfood and stays on `file:` / vendor until G1
  - Server page: Button, Stack, Heading, Card content
  - Client island: Switch (Dialog when it exists)
  - View-source / JS disabled: layout + type + buttons still styled
  - No FOUC from missing `index.css`
- [x] **C6 WCAG 2.2 AA** epic [MAV-29](https://kolmena.atlassian.net/browse/MAV-29) **Done** (all children). Required for 0.1.0. Contrast / 24×24 / focus rings stay Storybook + C3 (jsdom cannot prove them).
- [x] **C7 a11y tests** epic [MAV-45](https://kolmena.atlassian.net/browse/MAV-45) **Done** (Vitest + axe; no Playwright/Chromatic). Required for 0.1.0.
- [ ] **C5** record gzip/brotli of `index.css` in BACKLOG (baseline 2026-09-07: ~53 KB raw / ~9.6 KB gzip / ~7.5 KB brotli)
- [ ] C1/C2 can trail a preview publish if PO waives; **C4, C6, and C7 cannot**

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

- [ ] Public repo **kolmenadev/becket-ui** exists
- [ ] Clone without GitHub auth shows README + source
- [ ] npm `repository` URLs resolve (no 404)

---

## D0 — create the public GitHub repo

Private SoT stays [kolmenadev/becket](https://github.com/kolmenadev/becket). npm metadata already points at **becket-ui** so consumers never hit a private URL.

1. Under org `kolmenadev`, create public repo `becket-ui` (MIT).
2. Push a publishable tree (mirror or subtree). **CI and `npm publish` should run from the public repo** if you want npm provenance (OIDC needs a public remote).
3. Confirm `https://github.com/kolmenadev/becket-ui` loads logged-out.
4. Optional: keep private `maverick` as SoT and sync to `becket-ui` on release; or make `becket-ui` the only remote after first publish. Pick one and document it in README. Default: **private SoT + public mirror** until you are tired of dual remotes.

**AC**

- [ ] Logged-out GitHub user can read README
- [ ] `repository` fields in both `package.json` files resolve

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

Manual smoke (G0 leftover):

```bash
# from repo root after pack:check — install tarballs in a throwaway Vite or Next app
pnpm pack --filter @becket-ui/tokens
pnpm pack --filter @becket-ui/react
# in the throwaway app:
# pnpm add ./maverick-tokens-0.1.0.tgz ./maverick-react-0.1.0.tgz
# import '@becket-ui/tokens/index.css' and <Button>
```

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

```bash
# machine that is not this monorepo
pnpm add @becket-ui/react @becket-ui/tokens
```

```ts
import '@becket-ui/tokens/index.css';
import { Button } from '@becket-ui/react';
```

```html
<html data-theme="dark">
```

**AC**

- [ ] Install works on a clean machine
- [ ] A consuming app (Magnum Opus) can switch from `file:` to `^0.1.0` without Vite aliases. `apps/next-example` stays the packed-tarball replica and is **not** Magnum Opus.
- [ ] Packed contents still match `pnpm pack:check`

---

## D2 — docs after the bits are live

- [ ] README: remove “not published yet”; install command is the real one
- [ ] Changeset changelog is on GitHub
- [ ] Optional: host Storybook (Chromatic is already in docs deps, unused)
- [ ] Optional: one Confluence SD page that **links** ABOUT + BACKLOG + WHY + this file — do not duplicate the catalog

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
3. npm org + first `npm publish` (tokens, then react) — **blocked on 1 + 2**
4. Point first-party **product** dogfood (Magnum Opus) at `^0.1.0`. Keep a local path override only as a *dev* escape hatch. Do **not** restyle Magnum Opus as a throwaway Next app — `apps/next-example` already is the packed-tarball consumer.
5. C1 tests / C2 lint / C5 size-limit can land in the same week as 3–4
6. Consumer MCP ([MAV-36](https://kolmena.atlassian.net/browse/MAV-36)) can parallel any of the above. It does **not** block step 3.
7. Figma library ([MAV-49](https://kolmena.atlassian.net/browse/MAV-49)) can parallel any of the above. It does **not** block step 3.

**Next engineering step:** D0 public `becket-ui` ([MAV-12](https://kolmena.atlassian.net/browse/MAV-12)). A11y G1 code + tests are in-repo. Do not `npm publish` until public GitHub exists. MCP is optional — start at [MAV-37](https://kolmena.atlassian.net/browse/MAV-37).

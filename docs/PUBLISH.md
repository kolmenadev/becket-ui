# How to publish `@becket-ui/react` + `@becket-ui/tokens`

Operational checklist. Positioning: [WHY.md](./WHY.md). Product shape: [ABOUT.md](./ABOUT.md). Remaining kit work: [BACKLOG.md](./BACKLOG.md).

**First public version is 0.1.0** (not 1.0.0). Packages are already versioned `0.1.0` in-repo. They are **not** on the public npm registry until this checklist is done.

There are two gates. Do not mix them.

| Gate | Meaning | Status (2026-09-07) |
| --- | --- | --- |
| **G0 — physically publishable** | Tarballs contain CSS + `dist` + preset; CI pack-check is green | **Met in-repo** (`pnpm pack:check`) |
| **G1 — 0.1.0 is honest** | Curated kit + Next SSR proof + public GitHub | **Not met** (Phase B + C4 + D0) |

Locked: **do not run `npm publish` until G1**, unless PO explicitly waives the kit/SSR gate for a tagged preview (`0.1.0-next.0`). Default is wait.

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

**Still false:** `https://github.com/kolmenadev/becket-ui` does not exist. npm install of `@becket-ui/react` does not work on a clean machine.

---

## G1 — before the first public 0.1.0

Treat this as the “solid preview kit” bar. AC is testable.

### Product (Phase B)

- [ ] v1 primitives shipped: Checkbox, Radio, Select, Textarea, Link, Separator, Spinner, Table, Tabs, Dialog, Drawer, Menu (see [BACKLOG.md](./BACKLOG.md) Phase B)
- [ ] Select + Textarea use Field (`invalid` + error id)
- [ ] No product/trading names in public exports
- [ ] Native HTML first; no Zag / Ark / Chakra v3 machines

### Quality (Phase C — minimum for G1)

- [ ] **C4** `apps/next-example`: App Router consumes **packed tarballs** (not `src/`)
  - Server page: Button, Stack, Heading, Card content
  - Client island: Switch (Dialog when it exists)
  - View-source / JS disabled: layout + type + buttons still styled
  - No FOUC from missing `index.css`
- [ ] **C5** record gzip/brotli of `index.css` in BACKLOG (baseline 2026-09-07: ~53 KB raw / ~9.6 KB gzip / ~7.5 KB brotli)
- [ ] C1/C2/C3 can trail a preview publish if PO waives; C4 cannot

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

1. **npm org `becket-ui`.** Packages are `@becket-ui/react` and `@becket-ui/tokens`. Create or join that org on [npmjs.com](https://www.npmjs.com). Confirm the names are not taken by someone else.
2. **2FA** on the publishing npm user.
3. **`NPM_TOKEN`** (automation) or GitHub Actions **OIDC provenance** (`id-token: write` + npm trusted publisher). First publish may be a manual `npm publish` from a clean checkout of `becket-ui`.
4. Org members: at least one other Kolmena owner so the scope is not a single-person bus factor.

Out of scope for 0.1.0: relocating to `@kolmena/*`. Scope is locked `@becket-ui`.

---

## D1 — publish 0.1.0

Run from a **clean clone of the public repo** (or the private SoT if that is the chosen publish remote). Do not publish from a dirty worktree with Magnum Opus-only experiments.

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
- [ ] Magnum Opus (or any dogfood app) can switch from `file:` to `^0.1.0` without Vite aliases
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

---

## Suggested sequence (engineering)

1. Finish Phase B forms (Checkbox → Field-wired Select/Textarea) — unblocks dogfood
2. Overlays (Dialog, Drawer, Menu) + Table/Tabs/Spinner/Link/Separator
3. **C4 Next example** (SSR gate)
4. D0 public `becket-ui`
5. npm org + first `npm publish` (tokens, then react)
6. Point dogfood apps at `^0.1.0`
7. C1 tests / C2 lint / C5 size-limit can land in the same week as 5–6

**Next engineering step after docs:** Phase B Checkbox (MDC already sketches it), not `npm publish`.

# What Becket is

Becket is a **publishable, product-agnostic design system**: Panda CSS tokens plus thin React 19 wrappers. It is built so most styling happens at **compile time**, HTML stays semantic, and consumer apps can SSR without a CSS-in-JS runtime.

It is **inspired by Chakra UI’s API** (layout primitives, `as`, recipe variants, compound slots) — not a Chakra port. Chakra v3 runs Zag/Ark state machines. Becket does not.

**Who it is for:** small and mid React apps that need a UI this week — typed components, tokens, one CSS import — not a Tailwind design system they have to invent. Tailwind already compiles CSS; it does not give you a reusable `<Button visual="primary">`. Dogfooding in our own products is how the kit stays honest. Positioning vs Tailwind / shadcn / Park / Chakra / Mantine: [WHY.md](./WHY.md).

Work remaining: [BACKLOG.md](./BACKLOG.md). First public npm release: [PUBLISH.md](./PUBLISH.md).

## Remotes

| Role | Repo |
| --- | --- |
| Private source of truth (this repo) | [kolmenadev/becket](https://github.com/kolmenadev/becket) |
| Public GitHub (npm `repository` / issues / homepage) | [kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui) — create and push before Phase D |

npm metadata on `@becket-ui/react` and `@becket-ui/tokens` points at **becket-ui** so consumers are not sent to a private URL.

---

## Thesis

| Goal | How Becket does it |
| --- | --- |
| SSR-first | Prebuilt CSS. Components render class names. No style injection at runtime. |
| Compile-time CSS | Panda recipes, patterns, and `staticCss` generate `index.css` in `@becket-ui/tokens`. |
| Minimal runtime JS | Native elements first (`<button>`, `<input>`, `<dialog>`, `<select>`). JS only for behavior the platform does not give you. **Not** absolute-zero styling JS (Panda still maps variants → class names). |
| Product-agnostic | Public API is generic primitives only. No Magnum Opus / trading names, no dashboard presets. |
| Consumer simplicity | Install two packages, import CSS once, set `data-theme`. Panda and Tailwind are **not** required in the app. |

**Do not** adopt Zag, Ark UI, or Chakra v3 machines. That would abandon the compile-time + native-HTML thesis.

**Do not** add a consumer bundler plugin to fold `css()` to strings. That forces every small app to run a compiler — the opposite of the consume model. Revisit only if C5 size-limit says the class-map is a problem.

---

## Packages

Turbo + pnpm monorepo.

```
apps/docs              Storybook (local docs)
packages/tokens        @becket-ui/tokens — Panda theme, recipes, generated CSS
packages/react         @becket-ui/react  — React components
```

```
@becket-ui/tokens          @becket-ui/react           Consumer
Panda codegen + CSS  -->  thin wrappers       -->  import CSS once
                          Storybook uses both      + components
```

### `@becket-ui/tokens`

Source of visual truth. Config: [`packages/tokens/panda.config.ts`](../packages/tokens/panda.config.ts).

- Class prefix: `beckui-` (CSS variables `--beckui--*`, classes `.beckui--button`)
- Build: `panda codegen` → `panda cssgen` → [`scripts/bundle-css.mjs`](../packages/tokens/scripts/bundle-css.mjs)
- Bundled stylesheet: `index.css` = Panda `styles.css` + [`theme-base.css`](../packages/tokens/theme-base.css) (no CSS `@import` — Vite can strip nested imports)
- Theme: dark by default. Light/dark via `data-theme="dark" | "light"` on `<html>`
- Spacing / sizes: Fibonacci `0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 34` plus semantic `xs | sm | md | lg | xl`
- Breakpoints (Chakra-aligned): `sm` 30rem, `md` 48rem, `lg` 62rem, `xl` 80rem, `2xl` 96rem

**Exports (intended):**

| Import | Purpose |
| --- | --- |
| `@becket-ui/tokens/index.css` | Full theme + utilities + recipes (what apps should import) |
| `@becket-ui/tokens/styles.css` | Panda utilities only |
| `@becket-ui/tokens/css` | `css`, `cva`, `sva` |
| `@becket-ui/tokens/recipes` | Recipe functions + variant types |
| `@becket-ui/tokens/patterns` | Layout patterns (`flex`, `stack`, `grid`) |
| `@becket-ui/tokens/jsx` | Panda JSX factory (internal / advanced) |
| `@becket-ui/tokens/preset` | Panda `definePreset` + `BECKET_PREFIX` for apps that already run Panda |

### `@becket-ui/react`

Components consume recipes/patterns. They do not hardcode colors. Authoring rules: [`.cursor-config/becket.mdc`](../.cursor-config/becket.mdc).

API conventions:

- `forwardRef` on the underlying element
- optional `as` for element substitution (where it makes sense)
- variant props from recipe types
- HTML attributes of the base element forwarded
- class merge order: recipe → helper → consumer `className`

---

## How to consume (intended)

```ts
import '@becket-ui/tokens/index.css';
import { Button, Stack, Card } from '@becket-ui/react';
```

```html
<html data-theme="dark">
```

Prefer semantic spacing in apps (`gap="md"`). Numeric `gap={3}` is supported.

Consumers who **also** use Panda add `@becket-ui/tokens/preset` to their `panda.config.ts`. They should not copy `panda.config.ts` from this repo.

**Today:** Dogfood via `file:` / workspace links. Phase A packaging is in place (pack `styled-system` + react `dist`, preset export). Packages are **not** on the public registry until [PUBLISH.md](./PUBLISH.md) gate G1. See [BACKLOG.md](./BACKLOG.md).

---

## Public API — in vs out

**In:** reusable primitives another product would use without renaming.

**Out:** app presets, className strings for a specific dashboard, trading/domain widgets (charts, order books, status maps). Those stay in the consuming app.

Test: *Would another product reuse this without a rename?* If no → keep it out of `@becket-ui/react`.

---

## Current component surface

Exported from [`packages/react/src/index.ts`](../packages/react/src/index.ts):

| Family | Styling | Runtime JS |
| --- | --- | --- |
| Button | recipe | none |
| Heading | recipe | none |
| Text | `css()` + style props | none |
| Flex | `flex` pattern + optional gradient-border helper | none |
| Stack, HStack, VStack | `stack` pattern | none |
| SimpleGrid | `grid` pattern | none |
| Hide | responsive `display` | none (CSS media queries) |
| Tag, Badge | recipes + label color CSS vars | none |
| Field (+ Label/Helper/Error/Control/Select/Textarea, `useField`) | slot recipe | `useId` + context (a11y ids) |
| TextField | recipe on input; composes Field | via Field |
| Checkbox | slot recipe; native `<input type="checkbox">` | none (`useId` only) |
| Select | native `<select>` + Field | via Field |
| Textarea | native `<textarea>` + Field | via Field |
| Card (+ Header/Body/Footer/Title/Description) | slot recipe | `useContext` for size/visual |
| Switch | slot recipe | controlled/uncontrolled `useState` |
| Dialog / Drawer | native `<dialog>` | `showModal` / close (`"use client"`) |
| Menu | `<details>` / `<summary>` | Escape + arrow keys (`"use client"`) |
| Tabs | ARIA tabs | selection state (`"use client"`) |
| Table | slot recipe | `useContext` for size |
| Spinner | recipe (CSS animation) | none |
| Link | recipe; `<a>` default, `as` allowed | none |
| Separator | recipe; `<hr>` | none |
| Tooltip | recipe | portal, measure, timers (**heaviest**) |

`"use client"` is on Switch, Card, Field, TextField, Select, Textarea, Table, Dialog, Drawer, Menu, Tabs, and Tooltip. Layout/type/Button/Checkbox/Spinner/Link/Separator stay Server Component–safe when they do not import a client module. The published react build is unbundled so those directives stay on the leaf files.

---

## Token model

Defined under `theme.extend.tokens` in `panda.config.ts`:

- **Brand:** `becketYellow`, `hiveSage`, `combAmber` (identity only — do not reuse as status)
- **Aliases:** `primary`, `secondary`, `tertiary`, `primaryHover`
- **Neutral:** 50–900 (warm honey-charcoal), plus `background`, `lightBackground`, `text`, `lightText`, `muted`, `border`
- **Status:** `danger`, `warning`, `success` — independent hues from brand; never aliases of `primary` / `secondary` / `tertiary`
- **Gradients:** `primary`, `primaryHover`, `secondary`, `neutral`
- **Type:** Inter / JetBrains Mono; sizes `xs`–`6xl`; weights normal/medium/bold
- **Radii / shadows:** sm–xl / sm–lg, plus `elevated` (dark card shadow with a 1px highlight ring)

Light/dark is **not** a Panda `semanticTokens` layer yet. Recipes use `_light` / `_dark` conditions on `[data-theme]`, and `theme-base.css` sets body background/color. Promoting aliases to semantic tokens is Phase B.

`staticCss` pre-generates all recipes plus the layout utilities components actually use (gap scale, flex alignment, responsive grid columns). That is why a consumer can skip Panda codegen.

---

## vs Chakra UI

| | Chakra UI v3 | Becket |
| --- | --- | --- |
| Styling | Runtime recipe system + JS | Panda compile-time CSS |
| Overlays / forms | Zag state machines | Native HTML + CSS; small hooks only if needed |
| Catalog | 100+ components | Curated v1 kit (see backlog) |
| Theming | JS theme / semantic tokens | CSS variables + `data-theme` |
| Consumer setup | Provider + JS | One CSS import |
| CSS compiler in the consumer | No (Emotion runtime) | **No** (prebuilt `index.css`; Panda optional via preset) |

v1 is **not** Chakra parity. It is a kit large enough to build real product UI (dashboards, forms, dialogs, tables) without pulling in date pickers, charts, or comboboxes.

---

## v1 kit (locked)

**Ship:** current surface plus Checkbox, Radio, Select, Textarea, Dialog, Drawer, Menu, Tabs, Table, Separator, Spinner, Link.

**Out of v1:** accordion, combobox, toast, slider, pagination, tree, date/color pickers, charts.

Overlay approach: native `<dialog>`, `popover`, styled `<select>`. Tooltip stays as-is for v1 (do not rewrite on Zag).

---

## Authoring a new primitive

1. Add/extend a Panda recipe in `packages/tokens/recipes/`, register it in `panda.config.ts`, regenerate.
2. Implement in `packages/react/src/components/` (`forwardRef`, `as`, recipe variants, a11y).
3. Colocate `ComponentName.stories.tsx` with controls for every variant.
4. Export only a stable generic name from `packages/react/src/index.ts`.

Shared non-UI logic lives in `packages/react/src/helpers/`, not under `components/`.

---

## License

MIT © Kolmena. Root `LICENSE` and both package `license` fields match.

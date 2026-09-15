# Becket UI

Chakra-shaped React components whose styles are **compiled CSS**, not a CSS-in-JS runtime. Install two packages, import one stylesheet, set `data-theme`, start building.

Aimed at small and mid React apps that should not have to invent a Tailwind design system first.

**Source:** [github.com/kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui)

## Install

Packages are versioned **0.1.0** in this repo. They are **not on the public npm registry yet**.

Intended install once `0.1.0` is published:

```bash
pnpm add @becket-ui/react @becket-ui/tokens
```

Until then, depend on this GitHub repo or a `file:` / packed tarball of `@becket-ui/react` and `@becket-ui/tokens`.

```ts
import '@becket-ui/tokens/index.css';
import { Button } from '@becket-ui/react';
```

```html
<html data-theme="dark">
```

Apps that only use components do **not** need Panda, Tailwind, or a theme provider.

Rebrand with CSS variables after `index.css`, or `defineBecketTheme()` from `@becket-ui/tokens/theme`. See [docs/THEMING.md](./docs/THEMING.md).

### Optional: Panda already in the app

```ts
import { becketPreset, BECKET_PREFIX } from '@becket-ui/tokens/preset';

export default defineConfig({
  presets: [becketPreset],
  prefix: BECKET_PREFIX,
  theme: { extend: { tokens: { colors: { primary: { value: '...' } } } } },
});
```

Do not copy this repo’s `panda.config.ts` into the app.

### Panda CSS exports

Most apps only need `index.css` + `@becket-ui/react`. Advanced imports:

| Import | Purpose |
| --- | --- |
| `@becket-ui/tokens/index.css` | Theme + utilities + recipes (default) |
| `@becket-ui/tokens/styles.css` | Panda utilities only |
| `@becket-ui/tokens/css` | `css`, `cva`, `sva` |
| `@becket-ui/tokens/recipes` | Recipe functions + variant types |
| `@becket-ui/tokens/patterns` | Layout patterns |
| `@becket-ui/tokens/jsx` | Panda JSX factory |
| `@becket-ui/tokens/preset` | `definePreset` + `BECKET_PREFIX` |

Numeric `gap` on layout primitives uses the Fibonacci spacing scale: `0, 1, 2, 3, 5, 8, 13, 21, 34` (plus `xs`–`xl`). Prefer semantic tokens (`gap="md"`).

## Packages

- `@becket-ui/react` — React components
- `@becket-ui/tokens` — tokens, recipes, prebuilt CSS

Requirements: **React 19+**.

## Docs

- [Theming](./docs/THEMING.md) — brand CSS variables vs instance `style` / `className` (no theme provider)

## Contributing

Clone, Storybook, tests, and Turbo: [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © Kolmena de Software

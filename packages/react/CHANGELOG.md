# @becket-ui/react

## 0.2.0

### Minor Changes

- 93bc35d: Add `Container` and `Box`.

  - `Container`: centered page-width wrapper. `size="sm|md|lg|xl|full"` (48, 64, 72, 80rem or none;
    default `lg`), `padding="none|xs|sm|md|lg|xl"` for inline gutters (default `md`), and `as` for
    landmarks such as `main`.
  - `Box`: a block with token-only `padding`, `background="background|surface|subtle"` and `radius`,
    plus `as`.
  - New `container` and `box` recipes in `@becket-ui/tokens/recipes`, included in `index.css`.

  **Breaking for `@becket-ui/tokens/jsx` only:** Panda's built-in `Box` and `Container` JSX patterns
  are renamed to `PandaBox` and `PandaContainer`. Without the rename, Panda's extractor read
  Becket's `<Box>` and `<Container>` props as style props and emitted invalid CSS.
  `@becket-ui/react` users are unaffected.

- 4e70f5c: Add `Icon` and 13 built-in glyphs.

  - `Icon` sizes any inline SVG on the size scale (`size="sm|md|lg|xl"`: 1, 1.25, 1.5, 2rem) and
    colors it with `currentColor`. It's decorative (`aria-hidden`) by default; pass `label` to give
    it an accessible name (`role="img"`).
  - Glyphs, drawn on one 24px grid and stroke: `ChevronDownIcon`, `ChevronRightIcon`, `CloseIcon`,
    `MenuIcon`, `CheckIcon`, `CopyIcon`, `ExternalLinkIcon`, `LinkIcon`, `SearchIcon`, `SunIcon`,
    `MoonIcon`, `InfoIcon`, `WarningIcon`. They're tree-shakeable: importing one doesn't bundle the
    others.
  - New `icon` recipe in `@becket-ui/tokens/recipes`, included in `index.css`.

### Patch Changes

- a6dd5a8: Stop shipping compiled component tests (`dist/components/*.test.js`) in the npm package.
- Updated dependencies [93bc35d]
- Updated dependencies [4e70f5c]
  - @becket-ui/tokens@0.2.0

## 0.1.3

### Patch Changes

- 1b33772: Ship `guides/building-with-becket.md`, the coding guide for app code built with Becket,
  inside the package so coding agents can read it from `node_modules/@becket-ui/react/guides/`.
- 1a41420: Type `Button` by the element it renders: `<Button as="a" href="/docs">` now accepts
  anchor props (`href`, `target`, `rel`, `download`), and `href` on a plain `<Button>` is a type
  error. Runtime behavior is unchanged.
- @becket-ui/tokens@0.1.3

## 0.1.2

### Patch Changes

- c27c70b: Separate the warning and success colors from brand yellow and sage.
- Updated dependencies [c27c70b]
  - @becket-ui/tokens@0.1.2

## 0.1.1

### Patch Changes

- dc2e3e1: Meet WCAG 2.2 AA contrast on brand fills, danger text, and outline sage. Focus rings use
  a canvas + primary double stroke so they stay visible on yellow.
- Updated dependencies [dc2e3e1]
  - @becket-ui/tokens@0.1.1

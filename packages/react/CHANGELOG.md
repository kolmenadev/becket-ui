# @becket-ui/react

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

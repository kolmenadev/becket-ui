# @becket-ui/tokens

## 0.3.0

### Minor Changes

- ec9c22f: Add `Prose`, which styles HTML from Markdown or MDX with Becket tokens: headings,
  paragraphs, links, lists, blockquotes, inline code and code blocks, `kbd`, `mark`, images and
  figures, tables, definition lists and rules. `<Prose as="article" size="sm|md|lg">`; spacing
  scales with `size`. CSS only, no JS. Rules have zero specificity and skip anything inside
  `[data-not-prose]`, so embedded Becket components keep their own styles. New `prose` recipe in
  `@becket-ui/tokens/recipes`.
- 76fcf51: Rename the spacing token `2xs` to `2xl`.

  `2xs` resolved to Fibonacci step 13 (3.25rem), larger than `xl`, so the name said the opposite of
  the value. It's now `2xl`, the step after `xl` (`xs` 0.25 → `sm` 0.5 → `md` 0.75 → `lg` 1.25 →
  `xl` 2 → `2xl` 3.25rem).

  **Migration:** replace `gap="2xs"` with `gap="2xl"` (same 3.25rem), and
  `var(--beckui--spacing-2xs)` with `var(--beckui--spacing-2xl)`. TypeScript flags the old value.
  Numeric `gap={13}` is unchanged.

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

## 0.1.3

No changes in this release.

## 0.1.2

### Patch Changes

- c27c70b: Separate the warning and success colors from brand yellow and sage.

## 0.1.1

### Patch Changes

- dc2e3e1: Meet WCAG 2.2 AA contrast on brand fills, danger text, and outline sage. Focus rings use
  a canvas + primary double stroke so they stay visible on yellow.

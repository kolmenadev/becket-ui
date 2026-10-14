# @becket-ui/tokens

## 0.4.0

### Minor Changes

- 3c15eb4: Every recipe length now comes from a Becket scale, checked by a new tokens test.

  - `Avatar` sizes are Fibonacci steps: `sm` 20px, `md` 32px, `lg` 52px, and a new `xl` at 84px.
    Initials scale with the circle.
  - `AspectRatio` takes a named ratio instead of a number: `'1:1'`, `'3:2'`, `'5:3'`, `'8:5'`,
    `'13:8'`, their portrait flips, and `'16:9'` / `'9:16'` for video.
  - `Switch` height follows the type scale, and its track and thumb use Fibonacci proportions. `md`
    is slightly smaller and `lg` slightly larger.
  - `Textarea` heights, `Menu` minimum width and `Tooltip` maximum width move to Fibonacci size
    steps.
  - `Icon`, `Spinner`, `Checkbox`, `Radio` and `Select` use the type scale, at the same pixel sizes
    as before.

- 44fb747: Resize all of Becket with three CSS variables:

  - `--beckui--spacing-unit` (0.25rem) drives every Fibonacci spacing step, every size step, and
    button, field and tag padding.
  - `--beckui--spacing-text-unit` (0.25em) drives spacing inside running text.
  - `--beckui--font-sizes-base` (1rem) drives the type scale.

  `defineBecketTheme` accepts these as `spacing.unit`, `spacing.textUnit` and `fontSizes.base`.

  - New text-relative tokens: `spacing.text-1…text-13` and `fontSizes.text-xs…text-2xl`. Prose,
    Code, Kbd, Mark, List and Link use them instead of raw `em` values. A few values moved to the
    nearest step: the Prose `h1` is now 2em (was 2.25em), and Kbd padding is slightly larger.
  - Radii are in rem (same size at a 16px root).
  - Badge letter spacing uses the `wide` token.

- 3c15eb4: Add the basics for content sites and blogs.

  - Typography: `List` + `ListItem` (`as="ul|ol"`, `spacing`, `marker`), `Code`, `Kbd`, `Mark`,
    `Blockquote` + `BlockquoteCaption` (renders `figure > blockquote + figcaption`).
  - Media: `Image` (`alt` required, lazy-loaded, `fit`, `radius`), `Figure` (`caption`), `Avatar`
    (`name`, `src`, `size`; initials fallback, also when the photo fails to load).
  - Accessibility: `SkipLink` (hidden until focused, defaults to `#main`), `VisuallyHidden`.
  - Layout: `Center` (`inline`), `Grid` + `GridItem` (12 columns, responsive `columns` and `colSpan`
    incl. `"full"`; every count and span ships in the prebuilt CSS at every breakpoint),
    `AspectRatio` (`ratio`).
  - New recipes in `@becket-ui/tokens/recipes`: `list`, `code`, `kbd`, `mark`, `blockquote`,
    `image`, `figure`, `avatar`, `skipLink`, `visuallyHidden`, `center`, `aspectRatio`.

### Patch Changes

- 1aaf06d: Fix WCAG AA text contrast in light theme.

  - Links: new semantic tokens `link`, `linkHover` and `linkVisited`. Dark theme keeps the brand
    yellow and sage; light theme uses darker shades of the same hues. Light links go from 2.02:1 to
    4.62:1, hover and visited also pass, and dark visited links now clear 4.5:1 on surfaces. `Link`
    and `Prose` use them.
  - `muted` text in light theme moves from `neutral.600` (4.33:1) to a slightly darker gray
    (4.71:1).
  - New tokens test: every semantic text color is at least 4.5:1 on `background` and `surface` in
    both themes.

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

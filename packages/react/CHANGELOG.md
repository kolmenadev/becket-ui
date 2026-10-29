# @becket-ui/react

## 0.8.0

### Minor Changes

- d54b0a1: Add `Breadcrumb` and `Steps`, the rest of the navigation basics. Both render without
  client JS.

  - `Breadcrumb` (`size`, `separator: chevron | slash`) is a `nav` landmark around an ordered list
    of `BreadcrumbItem`s. An item is a link (`href`, `as` for a router link); `current` marks the
    page the user is on with `aria-current="page"`, as plain text when it has no `href`. Separators
    are drawn in CSS, so screen readers don't read them.
  - `Steps` (`orientation`, `size`) is a display-only list of `Step`s. Each step sets its own
    `status` (`complete | current | upcoming`); the current one gets `aria-current="step"`, and the
    others announce "(completed)" or "(not started)" after the title (`statusLabel` translates it).

  The `breadcrumb` and `steps` slot recipes ship in `@becket-ui/tokens`.

- a5c76b2: `Prose` now leaves embedded Becket components alone. Any element inside an article that
  carries a Becket class (a `Card`, `Alert`, `Code`…), and everything inside it, keeps its own
  styles with no wrapper, so a list or paragraph inside a card no longer picks up the article's
  margins and markers. `data-not-prose` still opts out markup that isn't Becket's.

  If you wrapped Becket components in `data-not-prose`, the wrapper still works and is no longer
  needed. If you relied on Prose styling markup inside a Becket component, style it there instead.

### Patch Changes

- Updated dependencies [d54b0a1]
- Updated dependencies [a5c76b2]
  - @becket-ui/tokens@0.8.0

## 0.7.0

### Minor Changes

- 21a870f: Add `Pagination`: links to the pages of a paged list, with previous and next. Every page
  is a plain link built by your `href(page)` function, so it works with server routing and renders
  without client JS. `linkAs` takes a router's link component, `siblings` sets how many pages show
  around the current one, and `labels` translates the text. The `pagination` slot recipe ships in
  `@becket-ui/tokens`. Also adds a `ChevronLeftIcon` glyph.

### Patch Changes

- Updated dependencies [21a870f]
  - @becket-ui/tokens@0.7.0

## 0.6.1

### Patch Changes

- Updated dependencies [5ec68db]
  - @becket-ui/tokens@0.6.1

## 0.6.0

### Patch Changes

- c14096a: Build `@becket-ui/tokens` with Panda CSS 2.3.

  If you only import `@becket-ui/tokens/index.css` and `@becket-ui/react`, nothing changes in how
  Becket components render. Apps that build their own CSS from the preset, or import Panda's
  generated modules from `@becket-ui/tokens`, should check the following.

  - **Panda 2 is required to use the preset.** The optional `@pandacss/dev` peer range is now
    `^2.0.0`. Panda 2 needs Node 22 or later.
  - **List `@pandacss/preset-base` next to the preset.** Once `presets` is set, Panda 2 no longer
    adds the base preset itself, so `stack`, `flex`, `grid` and the other patterns go missing
    without it: `presets: ['@pandacss/preset-base', becketPreset]`.
  - **Generated files are `.js` and `.d.ts`.** `styled-system/**/*.mjs` and `.d.mts` are gone. The
    package's exports point at the new files, so imports through `@becket-ui/tokens/*` don't change.
  - **Token types moved to `@becket-ui/tokens/types`.** `@becket-ui/tokens/tokens` now exports only
    the `token()` function. Import `GradientToken`, `ColorToken`, `Token` and the other token types
    from `@becket-ui/tokens/types`.
  - **Panda 2 renamed or removed some generated APIs.** `@becket-ui/tokens/jsx` replaces
    `createStyleContext` with `createRecipeContext` and `createSlotRecipeContext`.
    `@becket-ui/tokens/types` no longer exports `RecipeConfig`, `SlotRecipeConfig`, `Nested` and
    other config types (import those from `@pandacss/dev`). `@becket-ui/tokens/css` adds
    `keyframes`, `positionTry`, `viewTransition` and `firstThatWorks`.
  - **Compound variants are classes now.** A recipe with a compound variant returns one
    `--compound__…` class instead of atomic utilities (`hide({ below: 'lg' })` returns
    `beckui--hide--compound__…__below_lg`, not `beckui--d_none lg:beckui--d_contents`). Tests that
    match on class names need updating.
  - **Breakpoints use media query ranges.** `@media screen and (min-width: 48rem)` is now
    `@media (width >= 48rem)`: Safari 16.4 or later, and responsive styles now apply when printing
    too.
  - **Panda's built-in palette is oklch.** `red`, `blue`, `slate` and the other palettes from
    `@pandacss/preset-panda` now carry Tailwind 4's oklch values, and `mauve`, `olive`, `mist` and
    `taupe` are new. Becket's own colors, including `neutral.50`–`neutral.900`, are unchanged;
    `neutral.950`, which Becket doesn't define, now comes through as `oklch(14.5% 0 0)`. New tokens:
    `shadows.inner` and `aspectRatios.video`.
  - `sizes.prose` stays at 65ch. Becket now sets it, because Panda 2's default is 60ch.
  - `Avatar`, `Blockquote`, `Card`, `Checkbox`, `Dialog`, `Drawer`, `Field`, `Figure`, `Menu`,
    `Radio`, `Switch`, `Table` and `Tabs` recipes are registered as slot recipes. Their exports and
    class names are the same.
  - **Fixed:** `Flex` and `Stack` with `border="secondary"` or `border="neutral"` now draw the
    border. Only `primary` had CSS before.
  - Recipes that overrode each other by position (Prose spacing, AspectRatio children) now do it by
    specificity, because Panda 2 orders recipe rules differently. Every story's screenshot matches
    the previous release apart from the fix above.

- Updated dependencies [c14096a]
  - @becket-ui/tokens@0.6.0

## 0.5.1

### Patch Changes

- Updated dependencies [6c3934a]
  - @becket-ui/tokens@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [7f8d750]
  - @becket-ui/tokens@0.5.0

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

- Updated dependencies [1aaf06d]
- Updated dependencies [3c15eb4]
- Updated dependencies [44fb747]
- Updated dependencies [3c15eb4]
  - @becket-ui/tokens@0.4.0

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

### Patch Changes

- a67cd2e: Make `@becket-ui/react` importable with plain Node ESM. Relative imports in `dist` (JS
  and `.d.ts`) now end in `.js`, so scripts, `node --test` and bundler-free SSR can
  `import '@becket-ui/react'` instead of failing with `ERR_MODULE_NOT_FOUND`. Bundled apps are
  unaffected.
- Updated dependencies [ec9c22f]
- Updated dependencies [76fcf51]
  - @becket-ui/tokens@0.3.0

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

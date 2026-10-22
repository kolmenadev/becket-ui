---
"@becket-ui/tokens": minor
"@becket-ui/react": patch
---

Build `@becket-ui/tokens` with Panda CSS 2.3.

If you only import `@becket-ui/tokens/index.css` and `@becket-ui/react`, nothing changes in how
Becket components render. Apps that build their own CSS from the preset, or import Panda's generated
modules from `@becket-ui/tokens`, should check the following.

- **Panda 2 is required to use the preset.** The optional `@pandacss/dev` peer range is now
  `^2.0.0`. Panda 2 needs Node 22 or later.
- **List `@pandacss/preset-base` next to the preset.** Once `presets` is set, Panda 2 no longer adds
  the base preset itself, so `stack`, `flex`, `grid` and the other patterns go missing without it:
  `presets: ['@pandacss/preset-base', becketPreset]`.
- **Generated files are `.js` and `.d.ts`.** `styled-system/**/*.mjs` and `.d.mts` are gone. The
  package's exports point at the new files, so imports through `@becket-ui/tokens/*` don't change.
- **Token types moved to `@becket-ui/tokens/types`.** `@becket-ui/tokens/tokens` now exports only
  the `token()` function. Import `GradientToken`, `ColorToken`, `Token` and the other token types
  from `@becket-ui/tokens/types`.
- **Panda 2 renamed or removed some generated APIs.** `@becket-ui/tokens/jsx` replaces
  `createStyleContext` with `createRecipeContext` and `createSlotRecipeContext`.
  `@becket-ui/tokens/types` no longer exports `RecipeConfig`, `SlotRecipeConfig`, `Nested` and other
  config types (import those from `@pandacss/dev`). `@becket-ui/tokens/css` adds `keyframes`,
  `positionTry`, `viewTransition` and `firstThatWorks`.
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

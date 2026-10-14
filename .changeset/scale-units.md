---
'@becket-ui/tokens': minor
'@becket-ui/react': minor
---

Resize all of Becket with three CSS variables:

- `--beckui--spacing-unit` (0.25rem) drives every Fibonacci spacing step, every size step, and button, field and tag padding.
- `--beckui--spacing-text-unit` (0.25em) drives spacing inside running text.
- `--beckui--font-sizes-base` (1rem) drives the type scale.

`defineBecketTheme` accepts these as `spacing.unit`, `spacing.textUnit` and `fontSizes.base`.

- New text-relative tokens: `spacing.text-1…text-13` and `fontSizes.text-xs…text-2xl`. Prose, Code, Kbd, Mark, List and Link use them instead of raw `em` values. A few values moved to the nearest step: the Prose `h1` is now 2em (was 2.25em), and Kbd padding is slightly larger.
- Radii are in rem (same size at a 16px root).
- Badge letter spacing uses the `wide` token.

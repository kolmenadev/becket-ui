---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

defineBecketTheme rejects values that are not lengths, font names or colors; colors are
re-serialised.

- A length, font list or color that carries anything else (`4px; x: y`, `Inter}</style>`,
  `red; background: url(…)`) throws an error that names the key, such as `radii.md`.
- Colors are written in OKLCH, with the alpha kept: `#0a3d91` becomes `oklch(0.3856 0.1483 260.54)`.
  It's the same color within rounding: at most one step of 255 on a channel.
- Font names with spaces must be quoted (`'Open Sans', sans-serif`). `var()` and `calc()` values
  aren't accepted; set them in your own CSS.
- `parseColor` now returns null for malformed channels (`rgb(1;x 2 3)`, a fourth channel without
  `/`, an alpha above 1, `hsl(0, 100, 50)` with a bare saturation or lightness in the comma form)
  instead of reading the leading number. `hsl(0 100 50)` now reads a bare saturation and lightness
  as percentages, as CSS Color 4 does, where it used to clamp to white. A `5.` number or an angle
  unit on anything but a hue (`rgb(1deg 2 3)`) also returns null. A hue in `turn`, `grad` or `rad`
  is converted to degrees (`hsl(0.5turn 100% 50%)` is `hsl(180 100% 50%)`); it used to be read as
  that many degrees. Units and `none` are case-insensitive, as in CSS (`120DEG`).
- The MCP `set_theme` tool refuses keys over 32 characters and values over 64.

Migration: values that used to pass now throw, each naming its key.

- `fonts.sans: 'Open Sans, sans-serif'` becomes `"'Open Sans', sans-serif"`. Names with characters
  other than ASCII letters, digits, spaces, `.`, `_` and `-` aren't accepted.
- `var(--x)` and `calc(...)` in a length, font or color: put the value in your own CSS instead.
- A length is a number, optionally with `px`, `rem`, `em` or `%`.
- A color is hex, `rgb()`, `hsl()`, `oklch()` or a basic color name; `color-mix()` and the like
  throw. Hex now comes out as `oklch(...)`, the same color within rounding.

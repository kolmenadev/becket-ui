---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
"@becket-ui/mcp": patch
---

defineBecketTheme rejects values that are not lengths, font names or colors; colors are
re-serialised.

- A length, font list or color that carries anything else (`4px; x: y`, `Inter}</style>`,
  `red; background: url(…)`) throws an error that names the key, such as `radii.md`.
- Colors are written in OKLCH, with the alpha kept: `#0a3d91` becomes `oklch(0.3856 0.1483 260.54)`.
  It's the same color within rounding: at most one step of 255 on a channel.
- Font names with spaces must be quoted (`'Open Sans', sans-serif`). `var()` and `calc()` values
  aren't accepted; set them in your own CSS.
- New `parseColorAlpha` in `@becket-ui/tokens/theme` returns the color and its alpha. `parseColor`
  now returns null for malformed channels (`rgb(1;x 2 3)`, a fourth channel without `/`, an alpha
  above 1) instead of reading the leading number.
- The MCP `set_theme` tool refuses keys over 32 characters and values over 64.

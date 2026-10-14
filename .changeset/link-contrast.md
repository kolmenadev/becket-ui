---
'@becket-ui/tokens': patch
'@becket-ui/react': patch
---

Fix WCAG AA text contrast in light theme.

- Links: new semantic tokens `link`, `linkHover` and `linkVisited`. Dark theme keeps the brand yellow and sage; light theme uses darker shades of the same hues. Light links go from 2.02:1 to 4.62:1, hover and visited also pass, and dark visited links now clear 4.5:1 on surfaces. `Link` and `Prose` use them.
- `muted` text in light theme moves from `neutral.600` (4.33:1) to a slightly darker gray (4.71:1).
- New tokens test: every semantic text color is at least 4.5:1 on `background` and `surface` in both themes.

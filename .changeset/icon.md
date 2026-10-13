---
'@becket-ui/react': minor
'@becket-ui/tokens': minor
---

Add `Icon` and 13 built-in glyphs.

- `Icon` sizes any inline SVG on the size scale (`size="sm|md|lg|xl"`: 1, 1.25, 1.5, 2rem) and colors it with `currentColor`. It's decorative (`aria-hidden`) by default; pass `label` to give it an accessible name (`role="img"`).
- Glyphs, drawn on one 24px grid and stroke: `ChevronDownIcon`, `ChevronRightIcon`, `CloseIcon`, `MenuIcon`, `CheckIcon`, `CopyIcon`, `ExternalLinkIcon`, `LinkIcon`, `SearchIcon`, `SunIcon`, `MoonIcon`, `InfoIcon`, `WarningIcon`. They're tree-shakeable: importing one doesn't bundle the others.
- New `icon` recipe in `@becket-ui/tokens/recipes`, included in `index.css`.

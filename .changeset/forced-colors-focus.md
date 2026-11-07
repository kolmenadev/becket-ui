---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
---

Focus stays visible in Windows contrast themes (forced colors). Those themes drop box shadows, and
Becket drew every focus ring with one, so keyboard users saw no focus at all. Every focusable
component now also sets a transparent outline on focus, which the system repaints in its own color,
and `index.css` gives any `:focus-visible` element an outline in forced colors, so a recipe you
overrode keeps one too. Nothing changes outside forced colors.

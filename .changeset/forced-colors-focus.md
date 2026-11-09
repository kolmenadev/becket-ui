---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
---

Focus stays visible in Windows contrast themes (forced colors). Those themes drop box shadows, and
Becket drew every focus ring with one, so keyboard users saw no focus at all. Every focusable
component now also sets a transparent outline on focus, which the system repaints in its own color,
and in forced colors `index.css` outlines any `:focus-visible` element that doesn't set its own.
Nothing changes outside forced colors.

If you override a Becket recipe's focus style or write your own focus CSS, don't set `outline: none`
on focus: keep an outline (a transparent one is fine), or contrast-theme users lose the focus
indicator again. Becket's fallback doesn't override an outline you set.

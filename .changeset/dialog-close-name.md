---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
"@becket-ui/mcp": patch
---

`DialogClose` and `DrawerClose` with visible text, such as `<DialogClose>Cancel</DialogClose>`, are
now named by that text instead of "Close", so voice control users can say "click Cancel". The default
× button is still named "Close", and an explicit `aria-label` still wins.

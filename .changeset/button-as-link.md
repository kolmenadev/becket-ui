---
'@becket-ui/react': patch
---

Type `Button` by the element it renders: `<Button as="a" href="/docs">` now accepts anchor props (`href`, `target`, `rel`, `download`), and `href` on a plain `<Button>` is a type error. Runtime behavior is unchanged.

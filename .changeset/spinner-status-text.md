---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

`Spinner` announces its `label` ("Loading" by default) as visually hidden text inside its status
region, not as an `aria-label` on an empty element. New `label` prop. Passing `aria-label` still
works and now replaces the text as the name. `Spinner` no longer accepts `children`. To announce
loading reliably, keep a `<div role="status">` in the page before loading starts and mount
`<Spinner role={undefined} />` inside it.

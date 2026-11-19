---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
"@becket-ui/mcp": minor
---

`Spinner` announces its `label` ("Loading" by default) as visually hidden text inside its status
region, not as an `aria-label` on an empty element. New `label` prop sets the announced text.
`aria-label` still passes through and names the region; the text is never its name, because
`role="status"` takes its name from the author only.

Migrate: `Spinner` no longer accepts `children`, so pass that text as `label`. Tests that queried
`getByRole('status', { name: 'Loading' })` now query by text, for example `getByRole('status')` and
its text content, or `getByText('Loading')`. To announce loading reliably, keep a
`<div role="status">` in the page before loading starts and mount `<Spinner role={undefined} />`
inside it.

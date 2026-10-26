---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
---

Add `Pagination`: links to the pages of a paged list, with previous and next. Every page is a
plain link built by your `href(page)` function, so it works with server routing and renders
without client JS. `linkAs` takes a router's link component, `siblings` sets how many pages show
around the current one, and `labels` translates the text. The `pagination` slot recipe ships in
`@becket-ui/tokens`. Also adds a `ChevronLeftIcon` glyph.

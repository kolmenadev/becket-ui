---
"@becket-ui/react": minor
"@becket-ui/tokens": minor
---

`Prose` now leaves embedded Becket components alone. Any element inside an article that carries a
Becket class (a `Card`, `Alert`, `Code`…), and everything inside it, keeps its own styles with no
wrapper, so a list or paragraph inside a card no longer picks up the article's margins and
markers. `data-not-prose` still opts out markup that isn't Becket's.

If you wrapped Becket components in `data-not-prose`, the wrapper still works and is no longer
needed. If you relied on Prose styling markup inside a Becket component, style it there instead.

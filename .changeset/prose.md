---
'@becket-ui/react': minor
'@becket-ui/tokens': minor
---

Add `Prose`, which styles HTML from Markdown or MDX with Becket tokens: headings, paragraphs, links, lists, blockquotes, inline code and code blocks, `kbd`, `mark`, images and figures, tables, definition lists and rules. `<Prose as="article" size="sm|md|lg">`; spacing scales with `size`. CSS only, no JS. Rules have zero specificity and skip anything inside `[data-not-prose]`, so embedded Becket components keep their own styles. New `prose` recipe in `@becket-ui/tokens/recipes`.

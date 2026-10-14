---
'@becket-ui/react': minor
'@becket-ui/tokens': minor
---

Add the basics for content sites and blogs.

- Typography: `List` + `ListItem` (`as="ul|ol"`, `spacing`, `marker`), `Code`, `Kbd`, `Mark`, `Blockquote` + `BlockquoteCaption` (renders `figure > blockquote + figcaption`).
- Media: `Image` (`alt` required, lazy-loaded, `fit`, `radius`), `Figure` (`caption`), `Avatar` (`name`, `src`, `size`; initials fallback, also when the photo fails to load).
- Accessibility: `SkipLink` (hidden until focused, defaults to `#main`), `VisuallyHidden`.
- Layout: `Center` (`inline`), `Grid` + `GridItem` (12 columns, responsive `columns` and `colSpan` incl. `"full"`; every count and span ships in the prebuilt CSS at every breakpoint), `AspectRatio` (`ratio`).
- New recipes in `@becket-ui/tokens/recipes`: `list`, `code`, `kbd`, `mark`, `blockquote`, `image`, `figure`, `avatar`, `skipLink`, `visuallyHidden`, `center`, `aspectRatio`.

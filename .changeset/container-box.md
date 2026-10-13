---
'@becket-ui/react': minor
'@becket-ui/tokens': minor
---

Add `Container` and `Box`.

- `Container`: centered page-width wrapper. `size="sm|md|lg|xl|full"` (48, 64, 72, 80rem or none; default `lg`), `padding="none|xs|sm|md|lg|xl"` for inline gutters (default `md`), and `as` for landmarks such as `main`.
- `Box`: a block with token-only `padding`, `background="background|surface|subtle"` and `radius`, plus `as`.
- New `container` and `box` recipes in `@becket-ui/tokens/recipes`, included in `index.css`.

**Breaking for `@becket-ui/tokens/jsx` only:** Panda's built-in `Box` and `Container` JSX patterns are renamed to `PandaBox` and `PandaContainer`. Without the rename, Panda's extractor read Becket's `<Box>` and `<Container>` props as style props and emitted invalid CSS. `@becket-ui/react` users are unaffected.

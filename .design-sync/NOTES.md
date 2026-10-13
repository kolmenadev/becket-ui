# design-sync notes — Becket UI

## Scope
- 2026-10-13: first sync is a pilot of 5 components (Button, Field, Dialog, Card, Stack) at Miguel's request. The other 21 are excluded via `titleMap: {Name: null}` in config.json. Remove those entries to sync the full kit.

## Repo facts
- Monorepo (pnpm). DS package `packages/react` (@becket-ui/react); `main`/`exports` point at `src/index.ts` in the workspace, so the converter uses `--entry packages/react/dist/index.js` (unbundled ESM from tsup; tokens/recipes resolve from `@becket-ui/tokens`).
- Storybook config lives in `apps/docs/.storybook` (not next to the package); stories are `packages/react/src/components/*.stories.tsx`.
- React 19.3. Styles are compiled Panda CSS in `@becket-ui/tokens/index.css`; dark is default via `data-theme` on `<html>`.

## Fixes
- [GENERAL] `[FONT_MISSING]` Inter / JetBrains Mono -> Becket's font stacks name them but no package ships font files (Storybook didn't load them either) -> Miguel chose to ship them for the sync: `@fontsource/inter` + `@fontsource/jetbrains-mono` are devDependencies of `apps/docs`, loaded by Storybook via `apps/docs/.storybook/fonts.ts` (`previewAnnotations` in main.ts) and shipped via `cfg.extraFonts`. Becket's npm packages stay font-free.
- [GENERAL] `! preview decorator bundle failed: No loader ... .woff2` -> font CSS imported from `preview.ts` pulls woff2 binaries into the converter's decorator bundle -> keep font imports in `.storybook/fonts.ts`, never in `preview.ts`.
- [GENERAL] Storybook decorator forced `data-theme="dark"` whenever no background global was selected, which would override the Claude Design card's own theme switch -> decorator now sets `data-theme` only when a background is explicitly picked; `:root` is dark by default anyway.
- `[FONT_MISSING]` "Cambria" (`--beckui--fonts-serif`) is left over from `@pandacss/preset-panda`; no Becket recipe or component uses the serif stack. Substitute accepted pending Miguel's OK.
- `[CSS_FROM_STORYBOOK]`: `_ds_bundle.css` is scraped from sb-reference (minified Panda output). The real stylesheet `@becket-ui/tokens/index.css` also ships via `[TOKENS_PKG]` as `tokens/index.css`, first in `styles.css`. `cfg.cssEntry` can't point at it (bounded to packages/react).
- [GENERAL] Preview cards paint `body{background:#fff}` (converter card chrome, app-contract - not forkable), so dark-theme text (labels, helper text) was white-on-white -> the Storybook decorator in `apps/docs/.storybook/preview.ts` now wraps every story in a div painted with `--beckui--colors-background` / `--beckui--colors-text` (+0.75rem padding). Do NOT switch to `cfg.provider` for this: it would write "Wrap the tree in <X>" into every prompt.md, and Becket needs no provider.
- Sheet thumbnails downscale 1px borders and can make them look brighter - check raw/ PNGs before grading a border as a mismatch.

## Re-sync risks
- Pilot scope: 21 components excluded via `titleMap: null`; remove them to sync the full kit.
- Dialog stories (Default, Alert) only render the closed trigger, so the Dialog card never shows an open dialog. An open-state story (MAV-39 examples) would make the card useful; add it in Storybook, then re-sync (Dialog will need `cardMode: "single"`).
- Card "elevated" shadows spill outside the decorator surface onto white card chrome (framing, graded match).
- Fonts come from `@fontsource/*@5.3.0` devDeps of apps/docs; bumping them changes shipped font bytes (zero-regrade, re-upload).
- Cambria serif substitute pending Miguel's OK (unused by Becket).
- Converter toolchain: design-sync skill bundled with Claude Code 2.1.295; Storybook 10; React 19.3.

# design-sync notes — Becket UI

## Scope
- 2026-10-13: full kit synced (the 5-component pilot plus Flex, Tag, Radio, TextField, Badge, Checkbox, Switch, SimpleGrid, Heading, Select, Textarea, Separator, Link, Text, Hide, Drawer, Tooltip, Spinner, Table, Menu, Tabs). The pilot's `titleMap` null exclusions were removed.

## Repo facts
- Monorepo (pnpm). DS package `packages/react` (@becket-ui/react); `main`/`exports` point at `src/index.ts` in the workspace, so the converter uses `--entry packages/react/dist/index.js` (unbundled ESM from tsup; tokens/recipes resolve from `@becket-ui/tokens`).
- Storybook config lives in `apps/docs/.storybook` (not next to the package); stories are `packages/react/src/components/*.stories.tsx`.
- React 19.3. Styles are compiled Panda CSS in `@becket-ui/tokens/index.css`; dark is default via `data-theme` on `<html>`.

## Fixes
- [GENERAL] `[FONT_MISSING]` Inter / JetBrains Mono -> Becket's font stacks name them but no package ships font files (Storybook didn't load them either) -> Miguel chose to ship them for the sync: `@fontsource/inter` + `@fontsource/jetbrains-mono` are devDependencies of `apps/docs`, loaded by Storybook via `apps/docs/.storybook/fonts.ts` (`previewAnnotations` in main.ts). The converter harvests them from the reference Storybook's CSS (`[CSS_FROM_STORYBOOK]`). Becket's npm packages stay font-free.
- [GENERAL] **Build sb-reference with `STORYBOOK_BASE=./`** (relative asset URLs). With the default `/` base the scraped CSS has `url(/assets/...)` font paths the converter can't resolve, so it ships dead @font-face rules (Claude Design's checker flags them). Do NOT also set `cfg.extraFonts` - that ships a second copy of every face.
- `_ds_bundle.css` keeps its own copy of the 4 @font-face rules (rewritten to `./fonts/`) alongside `fonts/fonts.css` - converter behavior; identical rules, harmless. Claude Design's checker may still list them as duplicates.
- Claude Design's checker also lists custom properties under `::placeholder` and ~66 "unsorted" tokens: both come from Panda's generated CSS (`tokens/index.css`); not fixable without editing generated output. Advisory only.
- [GENERAL] `! preview decorator bundle failed: No loader ... .woff2` -> font CSS imported from `preview.ts` pulls woff2 binaries into the converter's decorator bundle -> keep font imports in `.storybook/fonts.ts`, never in `preview.ts`.
- [GENERAL] Storybook decorator forced `data-theme="dark"` whenever no background global was selected, which would override the Claude Design card's own theme switch -> decorator now sets `data-theme` only when a background is explicitly picked; `:root` is dark by default anyway.
- `[FONT_MISSING]` "Cambria" (`--beckui--fonts-serif`) is left over from `@pandacss/preset-panda`; no Becket recipe or component uses the serif stack. Substitute accepted by Miguel 2026-10-13.
- `[CSS_FROM_STORYBOOK]`: `_ds_bundle.css` is scraped from sb-reference (minified Panda output). The real stylesheet `@becket-ui/tokens/index.css` also ships via `[TOKENS_PKG]` as `tokens/index.css`, first in `styles.css`. `cfg.cssEntry` can't point at it (bounded to packages/react).
- [GENERAL] Preview cards paint `body{background:#fff}` (converter card chrome, app-contract - not forkable), so dark-theme text (labels, helper text) was white-on-white -> the Storybook decorator in `apps/docs/.storybook/preview.ts` now wraps every story in a div painted with `--beckui--colors-background` / `--beckui--colors-text` (+0.75rem padding). Do NOT switch to `cfg.provider` for this: it would write "Wrap the tree in <X>" into every prompt.md, and Becket needs no provider.
- Sheet thumbnails downscale 1px borders and can make them look brighter - check raw/ PNGs before grading a border as a mismatch.
- Switch: Sizes row is wider than a grid cell -> `[GRID_OVERFLOW] wide` -> `cfg.overrides.Switch.cardMode: "column"`. No other component flagged `[GRID_OVERFLOW]` or `[PORTAL?]`.
- Drawer, Menu, Tooltip: stories render the closed trigger (Drawer/Menu start closed; Tooltip only appears on hover), same as Dialog. Both panels match that resting state. No open surface is in the stories, so no `cardMode: "single"` — there is nothing to contain. An open-state story would need `cardMode: "single"` on the next sync.
- Hide: compare captures below the `lg` breakpoint, so `below="desktop"` content is hidden on both sides and Hide Below Desktop shows only the mobile line. Both panels agree. The desktop-visible branch is not in these shots.

## Re-sync risks
- Dialog, Drawer, and Menu have an `Open` story (starts open) and use `cardMode: "single"` + `primaryStory: "Open"`, so their cards show the panel. Other stories still start closed. Tooltip has no open prop, so its card shows only triggers; showing the bubble needs a library API (e.g. `defaultOpen`), which is a DS-owner decision.
- The converter's README always adds a "decorators ... theme/i18n providers" note when `.storybook/preview` has decorators. `emit.mjs` can't be forked and `cfg.provider` would be wrong (Becket has no provider), so `conventions.md` Setup explicitly says that note doesn't apply.
- Hide grades cover the below-desktop viewport only. A desktop-width capture would show the other branch.
- Switch uses `cardMode: "column"` so the Sizes row is not cropped. Presentation-only; grades carry.
- No owned previews. Every new component graded from the generated story wrappers.
- No accepted `close`s.
- Card "elevated" shadows spill outside the decorator surface onto white card chrome (framing, graded match).
- Fonts come from `@fontsource/*@5.3.0` devDeps of apps/docs; bumping them changes shipped font bytes (zero-regrade, re-upload).
- Cambria serif substitute accepted by Miguel 2026-10-13 (unused by Becket).
- Converter toolchain: design-sync skill bundled with Claude Code 2.1.295; Storybook 10; React 19.3.

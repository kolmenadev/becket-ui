# Which guides apply where

Read the listed sections in the guide itself. This map only says where to look.

| Files | Guides (sections) |
| --- | --- |
| Every source file, tests and scripts included | `docs/CODING-STYLE.md`, all of it |
| `packages/react/src/components/*.tsx` (not stories, tests or examples) | `.cursor-config/becket.mdc`: Golden rules, Folder structure, Naming, Component API rules, Layout / pattern-based components, Accessibility & UX checklist, Styling with PandaCSS, Brand vs status colors, Border prop behavior, Accessibility tests |
| `packages/react/src/helpers/**` | becket.mdc: Folder structure (no JSX, shared by 2+ components), Shared gradient border helper |
| `packages/react/src/components/*.stories.tsx` | becket.mdc: Storybook rules. `packages/react/guides/building-with-becket.md`, except where a story deliberately shows a raw element |
| `packages/react/src/components/*.test.tsx`, `packages/a11y/**` | CODING-STYLE: Testing. becket.mdc: Accessibility tests (axe through `@becket-ui/a11y`, keyboard tests for APG widgets, no Playwright or Chromatic) |
| `*.examples.tsx`, `apps/next-example/**`, anything built *with* Becket | `packages/react/guides/building-with-becket.md`, all of it, including the "Before you finish" list |
| `packages/tokens/recipes/**`, `packages/tokens/preset/**` | becket.mdc: Sizing and spacing (scale table and allowed exceptions), Brand vs status colors, the recipe template. `pnpm -F @becket-ui/tokens test` enforces the scale |
| `packages/tokens/theme/**` | CODING-STYLE. `docs/THEMING.md` for public theming behavior |
| `packages/mcp/**` | CODING-STYLE. The tool text agents read follows building-with-becket for any code it suggests |
| `apps/docs/**` (Storybook config) | CODING-STYLE. becket.mdc: Storybook rules |
| `scripts/**`, `*.config.*` | CODING-STYLE |
| Folder and file placement anywhere | becket.mdc: Folder structure. `.cursor/folder-structure.md` if the checkout has it (it's a local maintainer file: ≥3 items per folder, colocation, feature folder shape) |
| Root `README.md`, `docs/**`, `packages/*/README.md` | `.cursor-config/remotes.mdc`: the root README is in consumer voice, with no internal runbooks, Jira or first-party product names in the tree |
| `.design-sync/**` | `.design-sync/conventions.md` is generated guidance for Claude Design. It must agree with building-with-becket.md, which is the source |

## Shipping

| Moment | Guide |
| --- | --- |
| Branch | `.cursor-config/git-branch-naming.mdc`: `<type>/<scope>/<short-description>`, lowercase and hyphens, an allowed type |
| Changeset or version | `CONTRIBUTING.md`, "Versions": the fixed group, semver below 1.0, no changeset for docs, test or CI-only changes |
| Publish | `.cursor-config/remotes.mdc` "Publish", `.cursor/skills/publish-becket/SKILL.md` |
| Commit and PR text | The user's attribution rules and the repo's history: Conventional Commits with scope (`refactor(tokens, mcp): …`) |

## Known guide conflicts

Report these. Don't resolve them yourself. Until the owner decides, the more specific guide wins
for that pattern, and the finding goes under "Guide conflicts" rather than "must".

1. **Variant maps and class helpers.** becket.mdc ("Layout / pattern-based components") prescribes
   `JUSTIFY_MAP` / `ALIGN_MAP` and a small `mergeClassName(...)` helper. CODING-STYLE says
   UPPER_SNAKE is only for environment variables, and that a helper with fewer than three uses gets
   inlined. Proposal for the owner: camelCase the maps (`alignMap`), and keep `mergeClassName` only
   where three or more components share it, from `src/helpers`.
2. **`getGradientBorderClassName`.** becket.mdc names it as the helper's API. CODING-STYLE says no
   `get` prefix. Renaming it is an internal change (it isn't exported from the package). Check
   `packages/react/src/index.ts` first.
3. **Story import order.** becket.mdc's story template imports `./Component` before
   `@becket-ui/tokens/recipes`. CODING-STYLE wants third-party, then absolute, then relative.
4. **Public UPPER_SNAKE exports** (`BREAKPOINTS`, `SPACING_SCALE`, `BECKET_PUBLIC_COLOR_KEYS`, …).
   They're public API, so renaming them is a breaking change. That decision is MAV-138.

When you find a new conflict, add it here in the same change.

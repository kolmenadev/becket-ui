# Contributing to Becket UI

This file is for people who **clone this repository** to change the library. If you only want to use Button in an app, start at [README.md](./README.md) — you do not need Turbo, Storybook, or this monorepo.

This GitHub repo is the **only** code remote: [kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui). Kolmena maintainers keep publish gates, roadmap, and first-party dogfood in the Confluence [Becket UI](https://kolmena.atlassian.net/wiki/spaces/BU) space (not in this tree).

## Prerequisites

- Node.js 22.12+
- pnpm 12+ (repo `packageManager`: `pnpm@12.4.1`)

```bash
pnpm install
```

## Code style

Follow [docs/CODING-STYLE.md](./docs/CODING-STYLE.md) for all code, and [Writing app code with Becket](./packages/react/guides/building-with-becket.md) for code that uses Becket components. Library rules are in `.cursor-config/becket.mdc`. Read its "Sizing and spacing" table before writing a recipe: every length comes from a Becket scale, and `pnpm -F @becket-ui/tokens test` fails on raw `rem`/`px` or off-scale tokens.

## Develop

```bash
pnpm dev
```

Public catalog: [kolmenadev.github.io/becket-ui](https://kolmenadev.github.io/becket-ui/) (GitHub Pages, `main`).

Storybook (Storybook 10, `http://localhost:6006`):

```bash
pnpm --filter docs storybook
```

```bash
pnpm --filter @becket-ui/react storybook
```

Storybook resolves `@becket-ui/react` from workspace **`src/`**, not `dist/`. Published tarballs ship compiled `dist/` only.

## Build, test, pack

```bash
pnpm build
pnpm --filter @becket-ui/react exec tsc --noEmit -p tsconfig.build.json
pnpm --filter @becket-ui/a11y test
pnpm --filter @becket-ui/react test
pnpm --filter @becket-ui/tokens test
pnpm pack:check
```

Packed Next.js consumer (`apps/next-example`, not in the pnpm workspace):

```bash
pnpm example:dev
```

```bash
pnpm example:build
node scripts/assert-next-example.mjs
```

Example app: `http://localhost:3002`.

Root scripts: `pnpm dev` / `pnpm build` / `pnpm lint` run Turbo. `pnpm lint` has no package linters yet.

Format: Prettier is a root devDependency (`pnpm prettier --write .`).

## Layout

```
apps/docs           Storybook
apps/next-example   Packed-tarball consumer (distribution dogfood)
packages/react      @becket-ui/react
packages/tokens     @becket-ui/tokens
packages/a11y       Private Vitest + axe helper (not published)
```

Component authoring: [`.cursor-config/becket.mdc`](./.cursor-config/becket.mdc). Branch names: [`.cursor-config/git-branch-naming.mdc`](./.cursor-config/git-branch-naming.mdc).

## Versions

Record a consumer-facing bump on the feature branch with a file in `.changeset/`. Do not hand-edit package `version` fields. `@becket-ui/react`, `@becket-ui/tokens` and `@becket-ui/mcp` always ship the same version, so the MCP server always describes the library release with its number.

Becket follows semver, `major.minor.patch`:

| Bump | When | Examples |
| --- | --- | --- |
| `patch` | Fixes that keep the API and intended look | contrast fix, wrong prop type, packaging fix |
| `minor` | New features, or changes an existing app would notice | new component or token, new prop, a size or spacing change, a renamed token while below 1.0 |
| `major` | Breaking API changes once at 1.0 or later | removed component or prop, renamed export |

Below 1.0, breaking changes ship as `minor` (`^0.3.0` never installs 0.4.0) and the changeset says what to migrate. Releases group every pending changeset, and the largest bump wins. Docs, test and CI-only changes get no changeset. If the bump isn't obvious, ask the owner before committing it.

That file does not publish. npm and the GitHub Releases sidebar come from the release workflow. Runbook: [`.cursor/skills/publish-becket/SKILL.md`](./.cursor/skills/publish-becket/SKILL.md). Turbo only **builds**.

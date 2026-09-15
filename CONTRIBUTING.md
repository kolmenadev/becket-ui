# Contributing to Becket UI

This file is for people who **clone this repository** to change the library. If you only want to use Button in an app, start at [README.md](./README.md) — you do not need Turbo, Storybook, or this monorepo.

How private `becket` and public `becket-ui` are synced (and when it is allowed to push public): [docs/REMOTES.md](./docs/REMOTES.md).

## Prerequisites

- Node.js 22.12+
- pnpm 12+ (repo `packageManager`: `pnpm@12.4.1`)

```bash
pnpm install
```

## Develop

```bash
pnpm dev
```

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

```bash
pnpm changeset
```

First public `0.1.0` and later cuts: [docs/PUBLISH.md](./docs/PUBLISH.md), [docs/RELEASING.md](./docs/RELEASING.md).

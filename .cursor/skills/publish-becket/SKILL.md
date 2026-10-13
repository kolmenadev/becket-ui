---
name: publish-becket
description: >-
  Publishes @becket-ui/react and @becket-ui/tokens to the public npm registry
  and creates matching GitHub Releases. Use when the user asks to publish,
  cut a version, add a changeset, set up releases, or when the GitHub
  Releases list is empty.
---

# Publish Becket UI

Publish to `registry.npmjs.org` only. GitHub's Packages tab stays empty. The Releases sidebar is GitHub Releases from `.github/workflows/publish.yml`, tagged `@becket-ui/react@x.y.z` and `@becket-ui/tokens@x.y.z`.

## Packages

- Publish only `@becket-ui/react` and `@becket-ui/tokens`. They are a Changesets `fixed` group: one bump, the same version, two releases.
- Publish tokens first, then react. `changeset publish` already does that from the dependency graph.
- Never publish `@becket-ui/a11y`, `docs`, or the private root package.
- Do not publish to GitHub Packages (`npm.pkg.github.com`).
- `0.1.0` and `0.1.1` are already on npm and have no git tags. Do not republish them. Do not backfill GitHub Releases unless the user explicitly asks.

## Record a version

On the feature branch, add `.changeset/<short-name>.md`. Do not run the interactive `pnpm changeset` prompt. Do not edit `version` fields.

```md
---
"@becket-ui/react": patch
"@becket-ui/tokens": patch
---

What changed for consumers.
```

Use `patch`, `minor`, or `major` on both packages. If the user did not choose, ask. A docs, test, or CI-only change gets no changeset.

Commit the changeset only when the user asks to commit, or when it belongs to a PR they asked for. Merging that branch does not publish.

## One-time setup

Do this only when `.github/workflows/publish.yml` is missing and the user asked to set up releases or to publish.

1. Add the workflow below. Do not add a second registry.
2. Stop and tell the user to do these two things. They cannot be done from the repo:
   - On npm, for **each** of `@becket-ui/react` and `@becket-ui/tokens`: Settings → Trusted Publisher → GitHub Actions. Owner `kolmenadev`, repository `becket-ui`, workflow filename `publish.yml`, environment blank. Turn on **Allow npm publish**. npm warns that this is not recommended because it skips staged publishing. Changesets still runs `npm publish` and does not support `npm stage publish` yet, so leaving it unchecked makes the release workflow fail. Leave **npm dist-tag** off.
   - On GitHub: Settings → Actions → General → enable **Allow GitHub Actions to create and approve pull requests**.
3. Do not merge a Version Packages PR until both are done.

```yaml
name: Publish

on:
  push:
    branches: [main]

permissions: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  select-mode:
    runs-on: ubuntu-latest
    outputs:
      mode: ${{ steps.select-mode.outputs.mode }}
      publish-plan-artifact-id: ${{ steps.select-mode.outputs.publish-plan-artifact-id }}
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - id: select-mode
        uses: changesets/action/select-mode@v2

  version:
    if: needs.select-mode.outputs.mode == 'version'
    needs: select-mode
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: changesets/action/version@v2
        with:
          script: pnpm exec changeset version

  pack:
    if: needs.select-mode.outputs.mode == 'publish'
    needs: select-mode
    runs-on: ubuntu-latest
    outputs:
      pack-dir-artifact-id: ${{ steps.pack.outputs.pack-dir-artifact-id }}
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - id: pack
        uses: changesets/action/pack@v2
        with:
          publish-plan-artifact-id: ${{ needs.select-mode.outputs.publish-plan-artifact-id }}

  publish:
    needs: pack
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      # Trusted publishing needs npm >= 11.5.1. Node 22 does not ship that.
      - run: npm install -g npm@11.21.0
      - run: pnpm install --frozen-lockfile
      - uses: changesets/action/publish@v2
        with:
          pack-dir-artifact-id: ${{ needs.pack.outputs.pack-dir-artifact-id }}
```

Leave `create-github-releases` at its default (`true`). That is what fills the Releases sidebar.

Use npm trusted publishing. Do not add `NPM_TOKEN` or `NODE_AUTH_TOKEN`. Do not set `registry-url` on the publish job.

## Cut a release

After the workflow file is on `main` and the two human steps above are done:

1. The changeset file is on `main`.
2. The workflow opens or updates a **Version Packages** pull request. It bumps both versions, writes the changelogs, and deletes the changeset file. A person merges that PR.
3. That merge publishes. Expect `@becket-ui/tokens@<version>` and `@becket-ui/react@<version>` on npm and as GitHub Releases.
4. Confirm with `npm view @becket-ui/react version`, `npm view @becket-ui/tokens version`, and `gh release list --repo kolmenadev/becket-ui`.

If publish fails on auth, the trusted publisher is missing or the workflow filename is not `publish.yml`. Fix that. Do not `npm publish` from a laptop.

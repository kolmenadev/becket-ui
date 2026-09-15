# Versioning and releases

How we cut **every** `@becket-ui/react` + `@becket-ui/tokens` version after the bits exist, where the public release list lives, and how versions are chosen.

First-ship gates, npm org, and “do not `npm publish` until G1”: **[PUBLISH.md](./PUBLISH.md)**. This file does not replace that checklist.

We do not invent a custom runbook. This is the same stack public JS libraries already use: [Semantic Versioning](https://semver.org/), [Changesets](https://github.com/changesets/changesets), [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), GitHub Releases, and npm dist-tags.

---

## Locked

- **Packages version together.** `.changeset/config.json` `fixed` pair: `@becket-ui/react` and `@becket-ui/tokens` always share the same `x.y.z`. Do not publish one without the other.
- **First public version is 0.1.0**, not 1.0.0. `1.0.0` is a later, explicit “API is stable” cut.
- **Bump path is Changesets** (`pnpm changeset`). Do not hand-edit `packages/*/package.json` `version` fields.
- **Root `package.json` `version` is irrelevant** (private workspace). Ignore it.
- **`@becket-ui/a11y` and `docs` are not published.** They are already in Changesets `ignore`.
- **No auto-publish on every push to `main`.** A human merges a Version Packages PR (or runs the first D1 publish by hand). CI may open that PR; it must not `npm publish` from an ordinary feature merge.
- **Public GitHub is the consumer remote:** [kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui). Tags, GitHub Releases, and npm `repository` URLs live there. Private SoT stays [kolmenadev/becket](https://github.com/kolmenadev/becket).

---

## Version handling

[SemVer](https://semver.org/spec/v2.0.0.html). Each PR that changes a published package adds a changeset that declares **patch**, **minor**, or **major**.

| Intent | Changeset | 0.x result (today) | ≥ 1.0.0 result |
| --- | --- | --- | --- |
| Bug fix, a11y repair, docs-in-package that consumers see | **patch** | `0.1.0` → `0.1.1` | `1.2.3` → `1.2.4` |
| New primitive, new public token/CSS var, backwards-compatible API | **minor** | `0.1.1` → `0.2.0` | `1.2.4` → `1.3.0` |
| Breaking public API or CSS contract | **minor** while we are on **0.x**; **major** only when we mean **1.0.0** (or 2.0.0 later) | `0.2.0` → `0.3.0` | `1.3.0` → `2.0.0` |

**Why minor-for-breaking on 0.x:** SemVer says 0.y.z is initial development; a breaking change is `0.y+1.0`, not `1.0.0`. Marking those changesets **major** is how you accidentally ship 1.0.0. Do not do that until PO explicitly cuts 1.0.0.

**0.x caret trap (npm):** `^0.1.0` does **not** include `0.2.0` (`^0.1.0` ≡ `>=0.1.0 <0.2.0`). After a minor bump, Magnum Opus and every other consumer must raise the range on purpose. That is correct for a preview kit.

### What goes in a changeset

```bash
pnpm changeset
```

Write the summary for **consumers**, not git history. Keep a Changelog types (use these words in the body):

- **Added** — new primitive, variant, token, or export
- **Changed** — existing API or visual behavior
- **Deprecated** — still works; will be removed
- **Removed** — gone
- **Fixed** — bug / a11y
- **Security** — vulnerability

Good: `Added Radio and RadioGroup (native input, Field-aware).`  
Bad: `MAV-4`, `fix stuff`, or a dump of commit subjects.

Skip a changeset when the PR cannot affect a published tarball (Storybook-only, backlog docs, CI yaml, private `@becket-ui/a11y` internals with no react/tokens change).

---

## Where to post updates (the release list)

One list. Generate it; do not copy-paste it into five tools.

| Surface | Role |
| --- | --- |
| **[GitHub Releases](https://github.com/kolmenadev/becket-ui/releases)** on **becket-ui** | **The public release list.** One GitHub Release per version (`v0.1.0`, `v0.2.0`, …). Body = that version’s changelog. This is what you send people. |
| `packages/react/CHANGELOG.md` and `packages/tokens/CHANGELOG.md` | Portable changelog Changesets writes and commits. Same notes as the GitHub Release. Required so the history is in git, not only on github.com. |
| npm (`@becket-ui/react`, `@becket-ui/tokens`) | Installable versions. Dist-tag **`latest`** for the current stable line. |
| Confluence [Becket UI](https://kolmena.atlassian.net/wiki/spaces/BU/overview) | Internal hub. **Link** GitHub Releases + this file. Do **not** duplicate release notes. |
| Jira MAV | Work tracking (epics/tickets). Not the consumer changelog. Optional `fixVersion` is fine; it is not the SoT. |
| README | Current install command only. Point at GitHub Releases for history. |

Do not: paste notes into Slack/Confluence as a second changelog, use git-log diffs as the notes, or create Releases on the **private** `becket` repo (consumers never see that URL).

After the first publish, [MAV-14](https://kolmena.atlassian.net/browse/MAV-14) is the one-time “README install is real + changelog exists on GitHub” cleanup. Later versions only add another GitHub Release + changelog section.

---

## How a release is cut

### 1. Land work with changesets

Every publishable PR includes `.changeset/*.md`. Merge to `main` on the private SoT; sync / push the public **becket-ui** tree the same way you already plan for D0.

### 2. Version PR (or first D1 by hand)

When it is time to ship:

```bash
pnpm changeset version
```

That consumes changeset files, bumps both packages in lockstep, and prepends `CHANGELOG.md` sections. Review the diff. Fix wording now — this is what GitHub Releases will show.

First public `0.1.0`: follow [PUBLISH.md](./PUBLISH.md) D1 (clean clone of **becket-ui**, tokens then react, G1 still required). After that, prefer `pnpm changeset publish` (or the Changesets GitHub Action on **becket-ui**) so versions, git tags, and npm stay aligned.

### 3. Publish, tag, GitHub Release

Together, every time:

1. `pnpm changeset publish` (tokens + react, `access: public`).
2. Git tag **`vX.Y.Z`** on **becket-ui** (Changesets does this on publish).
3. **GitHub Release** `vX.Y.Z` on **becket-ui** whose body is the new changelog section. The Changesets Action creates this by default (`createGithubReleases: true`). If the first D1 is manual, create that one Release by hand from the changelog — do not skip it.

npm dist-tag: **`latest`**. Do not leave a stable line on `next`.

### 4. Verify

Run **all three gates** in [PUBLISH.md — Verify each published version](./PUBLISH.md#verify-each-published-version): tarball (`pack:check` + Next example) **before** publish; registry `pnpm add` on a clean machine **after**; Magnum Opus on `^X.Y.Z` with the Vite `src` alias **off**. Magnum Opus local HMR does not count. Raise Magnum Opus’s range on 0.x minors (`^0.1.0` does not include `0.2.0`).

---

## Prereleases

Only if PO waives G1 for a tagged preview, or we need a canary after 0.1.0 exists.

- Version form: `0.1.0-next.0` (Changesets `pre` mode, tag `next`).
- npm dist-tag **`next`**, never `latest`.
- GitHub Release: mark as **pre-release**.
- Consumers install with `@next` explicitly. First-party apps stay on `file:` / vendor until a real `latest` exists unless PO says otherwise.

Do not commit snapshot versions (`0.0.0-…`) to `main`.

---

## CI (after D1, not before)

Intended shape — the [Changesets GitHub Action](https://github.com/changesets/action) on **becket-ui** `main`:

1. Feature merges → action opens/updates a **Version Packages** PR (changelog + version bumps). Humans edit that PR if the notes are wrong.
2. Merging that PR → `changeset publish` + git tags + **GitHub Release**.
3. npm **trusted publishing** (OIDC, `id-token: write`) once the npm org is a trusted publisher. Until then, a short-lived automation token. 2FA on the human publisher for the first D1.

This is not “publish every main push.” Ordinary PRs only pack-check ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)). Do not wire the publish job until [PUBLISH.md](./PUBLISH.md) D1 has been done once.

---

## Yanked / mistaken publishes

If a version is broken badly enough to pull:

- Prefer `npm deprecate @becket-ui/react@X.Y.Z "reason"` (and the same for tokens) over unpublish.
- Changelog heading gets `[YANKED]` ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/)).
- GitHub Release stays; title includes yanked. Ship a patch.

---

## What we are not doing

| Out | Why |
| --- | --- |
| Independent versions per package | `fixed` pair; react peers tokens |
| Conventional-commits-only versioning | Changesets already records intent at PR time; commit messages are not the changelog |
| Confluence / Jira as the release list | Consumers and npm users never look there |
| Releases on private `becket` | npm metadata points at **becket-ui** |
| Publishing `@becket-ui/a11y` | Private test helper |
| `latest` on a prerelease | Would break `pnpm add @becket-ui/react` |

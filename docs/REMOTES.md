# Private vs public remotes

How [kolmenadev/becket](https://github.com/kolmenadev/becket) and [kolmenadev/becket-ui](https://github.com/kolmenadev/becket-ui) relate. First npm cut: [PUBLISH.md](./PUBLISH.md). Do not invent a third clone or a filtered “public-only” tree unless this file is updated first.

**Locked:** one git tree, two remotes. Not two folders. Not two READMEs in two histories.

| Remote name (local) | GitHub | Visibility | Role |
| --- | --- | --- | --- |
| `origin` | `kolmenadev/becket` | Private | Source of truth. Feature branches, PRs, review. |
| `public` | `kolmenadev/becket-ui` | Public | Consumer GitHub. npm `repository` / `homepage` / `bugs`. Tags and GitHub Releases. CI + `npm publish` for provenance. |

Local clone is this monorepo. Add the second remote once:

```bash
git remote add public git@github-kolmena:kolmenadev/becket-ui.git
```

Day-to-day work stays on `origin`. `public` only receives `main` after the checklist below.

---

## What is the same on both remotes

The **whole** publishable tree. That includes Turbo, Panda, Storybook, `apps/next-example`, private `@becket-ui/a11y`, `.cursor-config/`, and maintainer docs (`ABOUT`, `BACKLOG`, `PUBLISH`, this file).

**Keep Turbo (and pnpm workspaces) on the public repo.** Strangers installing `@becket-ui/react` from npm never run Turbo. People who clone GitHub to contribute, and GitHub Actions that pack/test/publish, do. Removing Turbo from public would break CI and provenance. Hide it from the **root README**, not from the tree.

Do **not** maintain a stripped public subtree unless PO explicitly switches this file to “filtered export.” Dual content is how the READMEs drift and secrets get pushed “just this once.”

---

## Voice: README vs the rest

| File | Audience | Voice |
| --- | --- | --- |
| **`README.md`** (root) | Someone who wants a Button this week | Install, import CSS, `data-theme`, theming, license. No Turbo, no Jira, no first-party product names, no “private SoT.” |
| **`CONTRIBUTING.md`** | Someone cloning this repo to patch it | Node/pnpm, `pnpm install`, Storybook, tests, pack-check. |
| **`docs/*`** | Maintainers / deep-dive | Thesis, backlog, publish gates, remotes, dogfood. May name first-party apps. |

If a sentence is only useful after `git clone` of this monorepo, it does **not** belong in `README.md`. Put it in `CONTRIBUTING.md` or `docs/`.

Root README must still be **honest** while packages are unpublished: show the intended `pnpm add` and say the registry cut has not shipped yet. Do not send consumers to the private `becket` URL.

---

## Verification before any push to `public`

**Agents and humans: do not `git push public` (or push to `kolmenadev/becket-ui`) unless the user explicitly asked to update the public repo in that conversation.** Merging to private `main` is not permission. CI on private `becket` is not permission.

Before a public push:

1. User said to publish/sync **this** tree to `becket-ui`.
2. Ref is **`origin/main`** (or a SHA the user named). Not a feature branch unless they named it.
3. Working tree dirt is **not** included unless they asked to commit it first.
4. Scan the diff vs the last public `main` for secrets (`.env`, tokens, credentials). This repo should have none.
5. Root `README.md` is still consumer voice (table above).
6. Show the user the command and the SHA, then push only after they confirm — unless they already said “push it” in the same request.

```bash
git fetch origin
git fetch public
git log --oneline public/main..origin/main
# user confirms
git push public refs/remotes/origin/main:refs/heads/main
```

Never `--force` to `public` unless the user explicitly requested a history rewrite.

---

## Git history — do we need to clean it?

**Default: no.** Public `becket-ui` is a mirror of private `main`, including history. That is intentional: same SHAs, fast-forward sync, tags that match.

| Worry | Rewrite history? |
| --- | --- |
| Secrets (tokens, `.env`, keys) in an old commit | **Yes** — rotate the secret, `git filter-repo` (or equivalent), force-push **public only** if private can keep the old commit, or both if the secret is still in private. |
| Old product name (`maverick`), Magnum Opus in `docs/`, Jira keys, Turbo | **No.** Those are in **current files** too if they still matter. Editing files hides them going forward. Rewriting history does not, unless you also delete the files. |
| “Looks like an internal repo” | Cosmetic. Optional one-time orphan/`--squash` **only if PO wants a single public root commit** and accepts the cost below. |

**Cost of a clean public history:** `origin/main` and `public/main` no longer share SHAs. Every later sync is a force-push or a replay. Dual remotes get error-prone. Do not do this casually. The public repo was empty before the first mirror; if PO still wants a squash, do it **once**, immediately, before anyone depends on those SHAs — and say so in this file.

What history **cannot** hide: anything still in `main` (README, `docs/ABOUT.md`, commit messages on new commits). Fix the files.

This library’s old name in past commits is not a credential leak.

---

## What must never go public

- Secrets, npm tokens, GitHub PATs, `.env*`
- Magnum Opus / trading credentials (they do not live in this repo; do not add them)
- A root README that tells strangers to `pnpm dev` / Turbo as the first step

First-party **product names in maintainer docs** (dogfood) are allowed. They are not allowed in the root README.

---

## npm vs GitHub

Making `becket-ui` public is **D0**. It does not publish npm. `@becket-ui/react` / `@becket-ui/tokens` stay off the registry until [PUBLISH.md](./PUBLISH.md) D1 (tokens then react), after G1.

---

## Switching to a single remote later

Default stays **private SoT + public mirror**. If dual remotes become the bottleneck, make `kolmenadev/becket-ui` the only `origin`, archive or stop pushing `becket`, and replace this file’s table. Do not silently change `git remote`.

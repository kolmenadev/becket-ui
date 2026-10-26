---
name: becket-guides
description: >-
  Enforces every Becket UI guide (docs/CODING-STYLE.md, .cursor-config/becket.mdc,
  packages/react/guides/building-with-becket.md, the branch, remotes and versioning rules) on
  any scope: a file, a folder, a glob, a package, the current diff, staged changes, a PR, or the
  whole repo. Reviews (report only) or enforces (fixes everything, proves behavior unchanged).
  Use it whenever someone asks to review, audit, check, lint, clean up or "fix the style" of
  Becket code, asks whether code follows the guides or the styleguide, before every commit or PR
  in this repo, and after writing or changing code here. Also use it when the user names a path
  ("check packages/mcp", "review Field.tsx against the guides").
---

# Becket guides

Becket's guides are the standard. This skill applies **all** of them to whatever scope you're given and
leaves nothing at "mostly". Every finding is either fixed or kept with a reason the guide itself
accepts, written as a comment in the code. Passing tests prove behavior. They say nothing about
style, so they never stand in for this check.

Two halves:

1. **Mechanical**: `scripts/style-check.mjs` checks the rules a parser can (single-use names,
   aliases, helpers below the Rule of 3, naming, casts, `any`, ignores, TODOs, keys, handlers,
   literal colors and lengths in app code, raw elements in app code, missing stories). It's fast, so
   run it first and run it last.
2. **Judgment**: `references/checklist.md` lists every rule a script can't decide (inversion of
   control, comments that say why, derived state, accessibility, recipes on the scale…). Read the code
   against each one.

The guides are the source of truth, not this skill and not your memory of them. Read the sections
that apply **in this session**, every time. If the checklist or the checker disagrees with a guide,
the guide wins: say so and fix the checklist or checker in the same change.

## 1. Pin down the request

- **Scope.** Paths, folders or globs; a package; `diff` (the branch against `main`); `staged`; a PR
  number (`gh pr diff <n> --name-only`, then check those files against the PR's base); or `all`. If
  the user gives none, use the current diff. For a diff, check the **added and changed lines**, and
  read the whole function around each one, because a new line can make an old name single-use.
- **Mode.** `review` reports and changes nothing. `enforce` fixes everything, then proves behavior is
  unchanged. "Review", "audit", "check" or "does this follow" mean review. "Fix", "clean up",
  "enforce" or "make it follow" mean enforce. When you wrote the code yourself in this session,
  always enforce.

## 2. Load the guides that apply

Map each file to its guides with `references/guide-map.md`, then read those sections now. Every file
gets docs/CODING-STYLE.md in full. Library components add becket.mdc. App code, examples and stories
add building-with-becket.md. Recipes add becket.mdc's "Sizing and spacing" and "Brand vs status
colors". A branch, commit or PR adds the branch, remotes and versioning rules.

## 3. Mechanical pass

From the repo root (the script needs `@typescript/typescript6`, which the tokens package installs):

```bash
node .cursor/skills/becket-guides/scripts/style-check.mjs --paths packages/mcp/src
```

Swap in `--all`, `--base main` (the default), or `--staged`. Each line reads `path:line [level]
message — guide § rule`. Levels:

- `must`: fix it, or keep it with a reason the guide accepts, written in a comment.
- `prefer`: the default. Fix it unless there's a reason, and write the reason down.
- `review`: look at it. It may be fine (an effect that really does sync with the outside world).

Also run the repo's own checks for the area: `pnpm -F @becket-ui/tokens test` for recipes and
tokens (it enforces the scale), `tsc --noEmit` for the package, and Prettier `--check` on files that
were already formatted at the base.

## 4. Judgment pass

Read every file in scope top to bottom with `references/checklist.md` open. Go rule by rule, and
don't stop at the first finding in a file. For a scope over about 30 files, go one package at a
time and report each package before moving on.

Read it the way the reviewer will. Name by name, ask: "Would inlining this read better?" That
question applies to locals and to aliases of a property too. At each branch ask: "Could the caller
decide this instead?" At each comment ask: "Does it say why, or only restate what the code does?"

## 5. Report

Group by file, most severe first. Use one line per finding, with the guide quoted closely enough to
check:

```
packages/mcp/src/theme/suggestTheme.ts
  193  must   `seen` aliases `input.colors` (used 2×). Write `input.colors.map(…)`.
              CODING-STYLE § Avoid hasty abstraction
```

End with:

- counts per rule and per level
- **Kept on purpose**: each kept name with its reason
- **Guide conflicts**: two guides that disagree, quoted side by side. Don't pick a winner. Until the
  owner decides, follow the more specific guide (becket.mdc for library components) and list the
  conflict. `references/guide-map.md` lists the known ones.
- **Not checked**: anything you couldn't verify, such as painted contrast or 24×24 targets (jsdom
  can't measure them; becket.mdc says to record them in Storybook).

In review mode, stop here. If the findings are more than one change can hold, offer tickets: Jira
project MAV, epic MAV-133, one story per package.

## 6. Enforce

1. Fix every `must` and `prefer`. Inline single-use names and aliases into their use. Write out a
   helper used twice, or restructure so it's needed once (`[a, b].map(…)`, a map callback's array
   argument, a loop whose first step is the pre-check). Put each value's reason in a comment at the
   use.
2. Keep a name only when the guide's reasons hold:
   - it's used three or more times
   - it calls itself
   - it's public API
   - inlining would change behavior: work repeated in a loop or callback, evaluation order (a timer
     started before the work it measures, a value read before it changes), or TypeScript narrowing

   Write the reason as a keep marker on the line right above the finding, so the checker reads it:

   ```ts
   // style-check keep: one user-event session for the whole walk; inlined, each tab starts a new one.
   const user = userEvent.setup();
   ```

   A kept finding stops blocking and failing, and reports list it under "Kept on purpose" (a notice
   on PRs). A marker with no reason is a `must`. `any`, `as any` and `@ts-ignore` can't be kept:
   the guide never excuses them. Use the marker only for a reason the guide accepts.
3. **Prove nothing changed.** Tests and the type check must pass. Where code produces output (MCP
   tool text, generated CSS, recipe classes, built data), compare old and new on real inputs.
   Snapshot the base version of the changed modules into a temp folder (`git archive <base> <paths>`),
   import both versions in a throwaway test, feed both the same inputs, and assert the outputs are
   byte-identical. For tokens, diff the built `index.css`. Delete the scaffolding afterwards.
4. Run the mechanical pass again, then reread every changed hunk with the checklist. A fix often
   creates the next finding: an inlined expression leaves an alias used once, or a merged branch
   leaves a helper with two uses. Repeat until only reasoned keeps remain.
5. Commit following the branch, commit and changeset rules (`references/guide-map.md`, "Shipping").
   One concern per commit. A pure style change needs no changeset.

## 7. The commit gate

`scripts/style-check.mjs --hook` is a Claude Code PreToolUse hook for `git commit`. It blocks the
first commit that adds findings and prints them. Committing the same findings again passes, so a
kept name with a written reason never deadlocks. Wire it in `.claude/settings.local.json`:

```json
{ "hooks": { "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command",
  "command": "node \"$CLAUDE_PROJECT_DIR/.cursor/skills/becket-guides/scripts/style-check.mjs\" --hook" }] }] } }
```

The hook runs the copy of the checker inside the checkout being committed, even when the session
started in another one (a worktree). A branch that changes the rules is checked by its own rules,
like the git hook does.

When it blocks, fix the findings, or mark a finding the guide allows you to keep with a
`// style-check keep: <reason>` line (step 6). Never commit again just to get past it.

The same gate runs for every contributor as a git hook: `.githooks/pre-commit` calls
`--staged --once`, and `pnpm install` sets `core.hooksPath` to `.githooks`. Both gates share one
record of the findings they've seen, so a commit that passed one passes the other. CI runs
`pnpm lint:style --base origin/<base>` on pull requests in warn mode.

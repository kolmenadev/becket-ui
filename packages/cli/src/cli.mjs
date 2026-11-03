#!/usr/bin/env node
/**
 * The mechanical half of Becket's guides. The becket-guides skill covers the half a script can't
 * judge. Rules come from docs/CODING-STYLE.md, packages/react/guides/building-with-becket.md and
 * .cursor-config/becket.mdc. When a guide changes, change its rule in rules/ to match the guide.
 *
 *   check --paths <file|folder>…   every line of those files
 *   check --all                    every tracked source file
 *   check --base main              lines added since main (the default)
 *   check --staged                 lines added in the index
 *   check --hook                   Claude Code PreToolUse gate for `git commit`
 *   check --staged --once          a git pre-commit gate
 *   add --repo <dir> to check another checkout
 *
 * Exit 1 on any finding. --hook and --once block a commit the first time they see a set of findings
 * and pass the same set on the next try, so a name kept on purpose (with its reason) can't block
 * forever. Both share one record, so a commit that passed the Claude Code hook passes the git hook.
 *
 * `// style-check keep: <reason>` on the line above a finding keeps it: it no longer blocks or
 * fails, and reports list it under "Kept on purpose" with its reason. Use it only where the guide
 * allows a keep (for names: 3+ uses, recursion, public API, or inlining would change behavior).
 * `any`, `as any` and `@ts-ignore` can't be kept, because the guide never excuses them.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { loadConfig } from './config.mjs';
import { check } from './engine.mjs';

const args = process.argv.slice(2);
let [repo, base] = [
  ['--repo', process.cwd()],
  ['--base', 'main'],
].map(([name, fallback]) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback));
let mode = ['--all', '--paths', '--staged'].find((flag) => args.includes(flag))?.slice(2) ?? 'base';

if (args.includes('--hook')) {
  const event = JSON.parse(readFileSync(0, 'utf8'));
  const command = event.tool_input?.command ?? '';
  // A quoted `-C` path may hold spaces; `\S+` alone would miss the commit and skip the check.
  // Named for its three uses: the gate, its `-C` operand, and where it starts in the command.
  const commit = command.match(/\bgit\b(?:\s+-C\s+("[^"]+"|'[^']+'|\S+))?\s+commit\b/);
  if (!commit) process.exit(0);
  // Commits run as `cd <checkout> && git commit …`, `git -C <checkout> commit …` or both. Resolve
  // them in Git's order: each `cd` before the commit, then that commit's own `-C` (an absolute path
  // wins). Text after the commit, like its message, can't move the checkout.
  repo = resolve(
    event.cwd ?? process.cwd(),
    ...[...command.slice(0, commit.index).matchAll(/\bcd\s+("[^"]+"|'[^']+'|\S+)\s*&&/g)].map(
      ([, path]) => path.replace(/^["']|["']$/g, ''),
    ),
    (commit[1] ?? '.').replace(/^["']|["']$/g, ''),
  );
  // A branch can change these rules, and the git hook always runs the committing checkout's copy.
  // Run that copy here too, so both gates report the same findings and pass on the same retry. The
  // copy sits where this entry script sits, relative to its checkout's root.
  // realpath follows an npm bin symlink to the script itself.
  const entry = realpathSync(process.argv[1]);
  const own = join(
    execFileSync('git', ['-C', repo, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim(),
    relative(
      execFileSync('git', ['-C', dirname(entry), 'rev-parse', '--show-toplevel'], {
        encoding: 'utf8',
      }).trim(),
      entry,
    ),
  );
  if (existsSync(own) && realpathSync(own) !== entry)
    process.exit(
      spawnSync(process.execPath, [own, ...args], {
        input: JSON.stringify(event),
        stdio: ['pipe', 'inherit', 'inherit'],
      }).status ?? 1,
    );
  // `commit -a` stages tracked changes at commit time, so check the working tree instead.
  mode = /\bcommit\b[^|;&]*\s-[a-zA-Z]*a/.test(command) ? 'head' : 'staged';
  base = 'HEAD';
}

repo = execFileSync('git', ['-C', repo, 'rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
// The paths after --paths, up to the next flag; none means the whole repo (--all).
const paths = mode === 'paths' ? args.slice(args.indexOf('--paths') + 1) : [];
const { kept, blocking } = check({
  repo,
  mode,
  base,
  paths: paths
    .slice(0, paths.findIndex((arg) => arg.startsWith('--')) + 1 || paths.length)
    .filter((path) => !path.startsWith('--'))
    .map((path) => resolve(path)),
  config: loadConfig(repo),
});

// Kept findings stay visible to a reviewer: listed in reports, and notices (not warnings) on a PR.
if (process.env.GITHUB_ACTIONS === 'true')
  for (const finding of kept)
    console.log(
      `::notice file=${finding.file},line=${finding.line}::kept: ${finding.reason} — [${finding.level}] ${finding.message}`,
    );
if (kept.length > 0 && !args.includes('--hook') && !args.includes('--once'))
  console.log(
    [
      `Kept on purpose: ${kept.length}`,
      ...kept
        .toSorted((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
        .map(
          (finding) =>
            `${finding.file}:${finding.line}  [${finding.level}] ${finding.message}\n    kept: ${finding.reason}`,
        ),
    ].join('\n'),
  );

if (blocking.length === 0) process.exit(0);
const reportText = [
  `Becket guides check: ${blocking.length} finding(s) (${['must', 'prefer', 'review'].map((level) => `${blocking.filter((finding) => finding.level === level).length} ${level}`).join(', ')})`,
  ...blocking
    .toSorted((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map(
      (finding) =>
        `${finding.file}:${finding.line}  [${finding.level}] ${finding.message}  — ${finding.rule}`,
    ),
].join('\n');

// GitHub Actions turns these lines into annotations on the PR's changed lines.
if (process.env.GITHUB_ACTIONS === 'true')
  for (const finding of blocking)
    console.log(
      `::warning file=${finding.file},line=${finding.line}::[${finding.level}] ${finding.message} — ${finding.rule}`,
    );
if (!args.includes('--hook') && !args.includes('--once')) {
  console.log(reportText);
  process.exit(1);
}
const seenPath = resolve(
  repo,
  execFileSync('git', ['-C', repo, 'rev-parse', '--git-path', 'becket-guides-seen'], {
    encoding: 'utf8',
  }).trim(),
);
const hash = createHash('sha256').update(reportText).digest('hex');
if (existsSync(seenPath) && readFileSync(seenPath, 'utf8') === hash) process.exit(0);
writeFileSync(seenPath, hash);
console.error(
  `${reportText}\n\nCommit blocked once by the becket-guides check. Fix every finding, restage and commit again. Keep something only for a reason the guide accepts (for names: 3+ uses, recursion, public API, or inlining would change behavior), written on the line above it as // style-check keep: <reason>. "review" items need a look, not necessarily a change. Re-running the same commit unchanged passes.`,
);
process.exit(2);

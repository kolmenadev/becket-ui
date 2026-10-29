// Runs today's style checker against throwaway git repos, so tests pin what it does (MAV-170)
// before MAV-171 splits it into an engine. Each repo is a real `git init` with real commits, because
// the checker reads scope from git (ls-files, diffs, the index).
import { spawnSync } from 'node:child_process';
import {
  closeSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../../../', import.meta.url));
export const checker = join(root, '.cursor/skills/becket-guides/scripts/style-check.mjs');

export const git = (repo, ...args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' });

/** Writes `files` ({ path: contents }) into the repo at `repo` (created when missing). */
export function write(repo, files) {
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), contents);
  }
}

/**
 * A git repo on `main` with `files` committed. The checker loads TypeScript through
 * `packages/tokens` (MAV-171 removes that), so the repo gets a stub of that package linked to the
 * real one's dependencies.
 */
export function makeRepo(files = {}, prefix = 'style-check-') {
  const repo = mkdtempSync(join(tmpdir(), prefix));
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'Style check tests');
  // No hooks: the repo under test must not run this repo's own pre-commit gate.
  git(repo, 'config', 'core.hooksPath', '/dev/null');
  write(repo, { 'packages/tokens/package.json': '{ "name": "stub" }\n', ...files });
  symlinkSync(
    join(root, 'packages/tokens/node_modules'),
    join(repo, 'packages/tokens/node_modules'),
  );
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', 'base');
  return repo;
}

export const removeRepo = (repo) => rmSync(repo, { recursive: true, force: true });

/**
 * Runs the checker in `repo`. Returns its exit status, its findings as report lines
 * (`path:line  [level] message  — rule`), the kept findings, and the raw output.
 */
export function check({ repo, args = ['--all'], input, env = {}, script = checker }) {
  // Output goes to a file, not a pipe: the checker calls process.exit() right after printing, and
  // Node drops whatever a pipe hasn't taken yet (about 64 KB), so a long report arrives cut off.
  const outputDir = mkdtempSync(join(tmpdir(), 'style-check-output-'));
  const outputFile = openSync(join(outputDir, 'output.txt'), 'w');
  // style-check keep: evaluation order; the checker must finish before its output file is read.
  const result = spawnSync(process.execPath, [script, '--repo', repo, ...args], {
    cwd: repo,
    input,
    stdio: ['pipe', outputFile, outputFile],
    env: { ...process.env, GITHUB_ACTIONS: '', ...env },
  });
  closeSync(outputFile);
  const output = readFileSync(join(outputDir, 'output.txt'), 'utf8');
  rmSync(outputDir, { recursive: true, force: true });
  return {
    status: result.status,
    output,
    findings: output
      .split('\n')
      .filter((line) => /^\S+:\d+ {2}\[(must|prefer|review)\] .+ {2}— /.test(line)),
    kept: output.split('\n').filter((line) => /^ {4}kept: /.test(line)),
  };
}

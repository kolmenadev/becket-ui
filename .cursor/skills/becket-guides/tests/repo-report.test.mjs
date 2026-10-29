// The checker's whole-repo report on a pinned commit of Becket, byte for byte (MAV-170). The code
// checked never changes, so the report changes only when the checker does, and the diff shows what
// it now reports differently. CI clones full history (fetch-depth: 0), so the commit is there.
// After an intended change, rewrite it: UPDATE_REPO_REPORT=1 node --test <this file>
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { after, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { check, git, makeRepo, removeRepo, root } from './harness.mjs';

// main after Version Packages (#65), 2026-10-28.
const pinned = 'ad00f815591cbe10a321188f2d00b258f48756ca';
const snapshot = fileURLToPath(new URL('./repo-report.txt', import.meta.url));

// An empty repo, filled with the pinned tree and committed, so `--all` sees it as tracked files.
const repo = makeRepo();
after(() => removeRepo(repo));

it(`reports the same findings on ${pinned.slice(0, 7)} as it did`, () => {
  // A shallow clone may lack the pinned commit: fetch just that commit, then fail loudly if it's
  // still missing, rather than checking an empty tree.
  if (spawnSync('git', ['-C', root, 'cat-file', '-e', `${pinned}^{commit}`]).status !== 0)
    spawnSync('git', ['-C', root, 'fetch', '-q', '--depth=1', 'origin', pinned]);
  const archive = spawnSync('git', ['-C', root, 'archive', '--format=tar', pinned], {
    maxBuffer: 256 * 1024 * 1024,
  });
  assert.equal(archive.status, 0, `can't read pinned commit ${pinned}: ${archive.stderr}`);
  assert.equal(spawnSync('tar', ['-x', '-C', repo], { input: archive.stdout }).status, 0);
  // makeRepo linked packages/tokens/node_modules; the pinned tree brings the real package.json.
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', 'pinned tree');
  const { status, output, findings } = check({ repo });
  // A crash also exits 1; only a complete report (summary line, findings, no stack trace) may
  // become the snapshot.
  assert.match(output, /^Becket guides check: \d+ finding\(s\)/m, 'not a checker report');
  assert.doesNotMatch(output, /^\s+at .+:\d+:\d+\)?$/m, 'the checker crashed');
  assert.ok(findings.length > 0, 'report has no findings');
  if (process.env.UPDATE_REPO_REPORT) writeFileSync(snapshot, output);
  assert.equal(status, 1);
  assert.equal(output, readFileSync(snapshot, 'utf8'));
});

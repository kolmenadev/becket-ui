import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// Runs the real script on a copy of the package, with at most one edit to contrast.mjs, so each
// policy case is the build's own exit code and message, not a reimplementation of its rules.
function checkTokensWith(edit) {
  const copy = mkdtempSync(join(tmpdir(), 'becket-check-tokens-'));
  try {
    for (const file of [
      'package.json',
      'index.css',
      'scripts/check-tokens.mjs',
      'theme/color.mjs',
      'theme/contrast.mjs',
      'theme/scale.test.mjs',
    ]) {
      cpSync(new URL(`../${file}`, import.meta.url), join(copy, file), { recursive: true });
    }
    if (edit) {
      const source = readFileSync(join(copy, 'theme/contrast.mjs'), 'utf8');
      assert.ok(source.includes(edit.find), `contrast.mjs no longer contains ${edit.find}`);
      writeFileSync(join(copy, 'theme/contrast.mjs'), source.replace(edit.find, edit.replace));
    }
    return spawnSync(process.execPath, [join(copy, 'scripts/check-tokens.mjs')], {
      encoding: 'utf8',
    });
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
}

test('the default theme passes: 40 rows, 4 of them tolerated known gaps', () => {
  const run = checkTokensWith();
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.match(/ known gap$/gm)?.length, 4);
  assert.match(run.stdout, /40 contrast rows: 0 failures, 4 known gaps\./);
});

test('a known gap without an issue fails the build and names the pair', () => {
  const run = checkTokensWith({ find: "    issue: 'MAV-166',\n", replace: '' });
  assert.equal(run.status, 1);
  assert.match(
    run.stderr,
    /neutral\.900 on tertiary \(dark\) is 4\.13:1, needs 4\.5:1: a known gap needs an issue/,
  );
});

test('a known gap fails the build once the package reaches its until', () => {
  const run = checkTokensWith({
    find: "issue: 'MAV-132',\n    until: '0.9.0',",
    replace: `issue: 'MAV-132',\n    until: '${JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version}',`,
  });
  assert.equal(run.status, 1);
  assert.match(
    run.stderr,
    /primary on background \(light\) is 2\.01:1, needs 3:1: known gap MAV-132 expired/,
  );
});

test('a known gap that now passes in every theme must be promoted to required', () => {
  // A 2:1 minimum lets primary on background (2.01:1) and on surface (2.2:1) pass in light.
  const run = checkTokensWith({ find: '    minimum: 3,\n', replace: '    minimum: 2,\n' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /primary on background now passes: promote to required/);
});

test('a required pair below its minimum fails the build with its ratio', () => {
  const run = checkTokensWith({
    find: "primary: 'oklch(0.75 0.15 78)'",
    replace: "primary: 'oklch(0.55 0.15 78)'",
  });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /neutral\.900 on primary\s+dark\s+3\.52:1\s+4\.5:1\s+required\s+FAIL/);
  assert.match(run.stderr, /neutral\.900 on primary \(dark\) is 3\.52:1, needs 4\.5:1/);
});

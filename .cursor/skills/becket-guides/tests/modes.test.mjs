// How the checker picks what to check and when it blocks, today (MAV-170): diff scopes, the keep
// marker, the two commit gates, the Claude Code hook's checkout resolution and hand-off, and
// GitHub annotations.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

import { check, checker, git, makeRepo, removeRepo, write } from './harness.mjs';

const repos = [];
after(() => repos.forEach(removeRepo));
// Named for its many uses: every test starts from a fresh repo and cleans it up afterwards.
const repoWith = (files, prefix) => {
  const repo = makeRepo(files, prefix);
  repos.push(repo);
  return repo;
};

// One finding per line, so a test can tell which lines were in scope.
const clean = 'export const a = 1;\n';
const twoGets =
  'export function getA() {\n  return 1;\n}\nexport function getB() {\n  return 2;\n}\n';

describe('scope', () => {
  it('--staged checks only lines added in the index', () => {
    const repo = repoWith({ 'src/a.ts': 'export function getOld() {\n  return 0;\n}\n' });
    write(repo, {
      'src/a.ts': `${readFileSync(join(repo, 'src/a.ts'), 'utf8')}export function getNew() {\n  return 1;\n}\n`,
    });
    git(repo, 'add', 'src/a.ts');
    write(repo, { 'src/b.ts': twoGets });
    const { status, findings } = check({ repo, args: ['--staged'] });
    assert.equal(status, 1);
    assert.deepEqual(
      findings.map((line) => line.split('  ')[0]),
      ['src/a.ts:4'],
    );
  });

  it('--base checks lines committed since the base branch, not the working tree', () => {
    const repo = repoWith({ 'src/a.ts': clean });
    git(repo, 'checkout', '-q', '-b', 'feature');
    write(repo, { 'src/a.ts': `${clean}export function getA() {\n  return 1;\n}\n` });
    git(repo, 'commit', '-qam', 'add getA');
    write(repo, { 'src/b.ts': twoGets });
    const { findings } = check({ repo, args: ['--base', 'main'] });
    assert.deepEqual(
      findings.map((line) => line.split('  ')[0]),
      ['src/a.ts:2'],
    );
  });

  it('--paths checks every line of the files named, and nothing else', () => {
    const { findings } = check({
      repo: repoWith({ 'src/a.ts': twoGets, 'src/b.ts': twoGets }),
      args: ['--paths', 'src/b.ts'],
    });
    assert.deepEqual(
      findings.map((line) => line.split('  ')[0]),
      ['src/b.ts:1', 'src/b.ts:4'],
    );
  });

  it('skips generated and non-source files', () => {
    const { status, findings } = check({
      repo: repoWith({
        'dist/a.ts': twoGets,
        'styled-system/a.ts': twoGets,
        'src/types.d.ts': 'type Unused = string;\n',
        'notes.md': '// TODO: anything\n',
      }),
    });
    assert.deepEqual(findings, []);
    assert.equal(status, 0);
  });
});

describe('keep marker', () => {
  it('keeps a finding with a reason, lists it, and exits 0', () => {
    const { status, findings, kept } = check({
      repo: repoWith({
        'src/a.ts':
          '// style-check keep: the platform API names it\nexport function getA() {\n  return 1;\n}\n',
      }),
    });
    assert.deepEqual(findings, []);
    assert.deepEqual(kept, ['    kept: the platform API names it']);
    assert.equal(status, 0);
  });

  it("can't keep any", () => {
    assert.equal(
      check({
        repo: repoWith({ 'src/a.ts': '// style-check keep: a reason\nexport const a: any = 1;\n' }),
      }).findings.length,
      1,
    );
  });

  it('reads the marker from the index in --staged, so an unstaged marker keeps nothing', () => {
    const repo = repoWith({ 'src/a.ts': clean });
    write(repo, { 'src/a.ts': `${clean}export function getA() {\n  return 1;\n}\n` });
    git(repo, 'add', 'src/a.ts');
    write(repo, {
      'src/a.ts': `${clean}// style-check keep: a reason\nexport function getA() {\n  return 1;\n}\n`,
    });
    assert.equal(check({ repo, args: ['--staged'] }).status, 1);
    git(repo, 'add', 'src/a.ts');
    assert.equal(check({ repo, args: ['--staged'] }).status, 0);
  });
});

describe('commit gates', () => {
  it('--once blocks the first time it sees a set of findings and passes the same set next time', () => {
    const repo = repoWith({ 'src/a.ts': clean });
    write(repo, { 'src/b.ts': twoGets });
    git(repo, 'add', 'src/b.ts');
    const first = check({ repo, args: ['--staged', '--once'] });
    assert.equal(first.status, 2);
    assert.match(first.output, /Commit blocked once/);
    assert.equal(check({ repo, args: ['--staged', '--once'] }).status, 0);
    // A different set of findings blocks again.
    write(repo, { 'src/c.ts': twoGets });
    git(repo, 'add', 'src/c.ts');
    assert.equal(check({ repo, args: ['--staged', '--once'] }).status, 2);
  });

  it('--hook ignores commands that are not commits', () => {
    const repo = repoWith({ 'src/b.ts': twoGets });
    const result = check({
      repo,
      args: ['--hook'],
      input: JSON.stringify({ cwd: repo, tool_input: { command: 'git status' } }),
    });
    assert.equal(result.status, 0);
    assert.equal(result.output, '');
  });

  it('--hook and --once share one record, so a commit the hook let through passes the git hook', () => {
    const repo = repoWith({ 'src/a.ts': clean });
    write(repo, { 'src/b.ts': twoGets });
    git(repo, 'add', 'src/b.ts');
    const event = JSON.stringify({ cwd: repo, tool_input: { command: 'git commit -m x' } });
    assert.equal(check({ repo, args: ['--hook'], input: event }).status, 2);
    assert.equal(check({ repo, args: ['--hook'], input: event }).status, 0);
    assert.equal(check({ repo, args: ['--staged', '--once'] }).status, 0);
  });

  it('--hook checks the working tree for commit -a', () => {
    const repo = repoWith({ 'src/a.ts': clean });
    write(repo, { 'src/a.ts': `${clean}export function getA() {\n  return 1;\n}\n` });
    assert.equal(
      check({
        repo,
        args: ['--hook'],
        input: JSON.stringify({ cwd: repo, tool_input: { command: 'git commit -am x' } }),
      }).status,
      2,
    );
  });
});

describe('hook checkout', () => {
  // A staged finding in `target`, and none where the event's cwd points, so a block proves the
  // hook resolved `target`.
  const staged = (prefix) => {
    const target = repoWith({ 'src/a.ts': clean }, prefix);
    write(target, { 'src/b.ts': twoGets });
    git(target, 'add', 'src/b.ts');
    return target;
  };
  const hook = ({ cwd, command, target }) =>
    check({
      repo: target,
      args: ['--hook'],
      input: JSON.stringify({ cwd, tool_input: { command } }),
    });

  it('follows cd', () => {
    const target = staged();
    assert.equal(
      hook({ cwd: repoWith(), command: `cd ${target} && git commit -m x`, target }).status,
      2,
    );
  });

  it('follows a quoted -C path with a space', () => {
    const target = staged('style check ');
    assert.equal(
      hook({ cwd: repoWith(), command: `git -C "${target}" commit -m x`, target }).status,
      2,
    );
  });

  it('resolves -C from the cd before it, as git does', () => {
    const target = staged();
    const [parent, name] = [join(target, '..'), target.split('/').at(-1)];
    assert.equal(
      hook({ cwd: repoWith(), command: `cd ${parent} && git -C ${name} commit -m x`, target })
        .status,
      2,
    );
  });

  it('ignores -C and cd inside the commit message', () => {
    const target = staged();
    const result = hook({
      cwd: repoWith(),
      command: `cd ${target} && git commit -m "Document git -C /tmp and cd /tmp && make"`,
      target,
    });
    assert.equal(result.status, 2);
    assert.doesNotMatch(result.output, /fatal/);
  });

  it("hands off to the committing checkout's own checker", () => {
    const target = staged();
    const [shebang, ...rest] = readFileSync(checker, 'utf8').split('\n');
    write(target, {
      '.cursor/skills/becket-guides/scripts/style-check.mjs': [
        shebang,
        'console.error("target copy ran");',
        ...rest,
      ].join('\n'),
    });
    const result = hook({ cwd: target, command: 'git commit -m x', target });
    assert.equal(result.output.match(/target copy ran/g)?.length, 1);
    assert.equal(result.status, 2);
  });
});

describe('GitHub annotations', () => {
  it('writes findings as warnings and kept findings as notices', () => {
    const { output } = check({
      repo: repoWith({
        'src/a.ts':
          'export function getA() {\n  return 1;\n}\n// style-check keep: a reason\nexport function getB() {\n  return 2;\n}\n',
      }),
      env: { GITHUB_ACTIONS: 'true' },
    });
    assert.match(output, /^::warning file=src\/a\.ts,line=1::\[must\] getA: /m);
    assert.match(output, /^::notice file=src\/a\.ts,line=5::kept: a reason — \[must\] getB: /m);
  });
});

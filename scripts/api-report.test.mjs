import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

function checkFixture(fixture) {
  const folder = mkdtempSync(join(tmpdir(), 'becket-api-fixture-'));
  try {
    mkdirSync(join(folder, 'base'), { recursive: true });
    mkdirSync(join(folder, 'head'), { recursive: true });
    mkdirSync(join(folder, '.changeset'), { recursive: true });
    mkdirSync(join(folder, 'packages/react'), { recursive: true });
    mkdirSync(join(folder, 'packages/tokens'), { recursive: true });
    for (const fileName of [
      'react.api.md',
      'tokens-preset.api.md',
      'tokens-theme.api.md',
      'tokens-recipes.api.json',
      'tokens-css-vars.api.txt',
    ]) {
      writeFileSync(join(folder, 'base', fileName), fixture.base?.[fileName] ?? 'same\n');
      writeFileSync(
        join(folder, 'head', fileName),
        fixture.head?.[fileName] ?? fixture.base?.[fileName] ?? 'same\n',
      );
    }
    writeFileSync(
      join(folder, 'packages/react/package.json'),
      `${JSON.stringify({ name: '@becket-ui/react', version: fixture.reactVersion ?? '0.8.1' })}\n`,
    );
    writeFileSync(
      join(folder, 'packages/tokens/package.json'),
      `${JSON.stringify({ name: '@becket-ui/tokens', version: fixture.tokensVersion ?? '0.8.1' })}\n`,
    );
    if (fixture.changeset) writeFileSync(join(folder, '.changeset/change.md'), fixture.changeset);
    return spawnSync(
      process.execPath,
      [
        join(dirname(fileURLToPath(import.meta.url)), 'api-report.mjs'),
        '--check',
        '--classify',
        folder,
      ],
      { encoding: 'utf8' },
    );
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

test('unchanged reports pass', () => {
  const result = checkFixture({});
  assert.equal(result.status, 0);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /removed API/);
});

test('an addition passes without a changeset', () => {
  const result = checkFixture({ head: { 'react.api.md': 'same\nexport const Added;\n' } });
  assert.equal(result.status, 0);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /removed API/);
});

test('a removal without a changeset fails', () => {
  const result = checkFixture({ head: { 'react.api.md': 'changed\n' } });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /^-(?!-)/m);
  assert.match(result.stderr, /removed API without a minor\/major changeset for @becket-ui\/react/);
  assert.doesNotMatch(result.stderr, /for @becket-ui\/tokens/);
});

test('a removal with a minor changeset passes below 1.0', () => {
  const result = checkFixture({
    base: { 'tokens-recipes.api.json': '{\n  "outline": []\n}\n' },
    head: { 'tokens-recipes.api.json': '{\n}\n' },
    changeset: '---\n"@becket-ui/tokens": minor\n---\n\nRemoved outline.\n',
  });
  assert.equal(result.status, 0);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /removed API/);
});

test('a patch changeset does not acknowledge a removal', () => {
  const result = checkFixture({
    head: { 'react.api.md': 'changed\n' },
    changeset: '---\n"@becket-ui/react": patch\n---\n\nNot enough.\n',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /removed API without a minor\/major changeset for @becket-ui\/react/);
});

test('a changeset for the other package does not acknowledge the removal', () => {
  const result = checkFixture({
    base: { 'tokens-css-vars.api.txt': 'same\n--beckui--colors-primary\n' },
    head: { 'tokens-css-vars.api.txt': 'same\n' },
    changeset: '---\n"@becket-ui/react": minor\n---\n\nReact only.\n',
  });
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /removed API without a minor\/major changeset for @becket-ui\/tokens/,
  );
  assert.doesNotMatch(result.stderr, /for @becket-ui\/react/);
});

test('from 1.0 a minor changeset does not acknowledge a removal', () => {
  const result = checkFixture({
    reactVersion: '1.0.0',
    head: { 'react.api.md': 'changed\n' },
    changeset: '---\n"@becket-ui/react": minor\n---\n\nToo small once stable.\n',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /removed API without a minor\/major changeset for @becket-ui\/react/);
});

test('from 1.0 a major changeset acknowledges a removal', () => {
  const result = checkFixture({
    reactVersion: '1.0.0',
    head: { 'react.api.md': 'changed\n' },
    changeset: '---\n"@becket-ui/react": major\n---\n\nBreaking.\n',
  });
  assert.equal(result.status, 0);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /removed API/);
});

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./export-tokens.mjs', import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), 'export-tokens-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const run = spawnSync(
  process.execPath,
  [
    script,
    '--manifest',
    join(scratch, 'manifest.json'),
    '--tokens-json',
    join(scratch, 'tokens.json'),
  ],
  { encoding: 'utf8' },
);
assert.equal(run.status, 0, run.stderr);
const manifest = JSON.parse(readFileSync(join(scratch, 'manifest.json'), 'utf8'));

// Fixtures write to their own paths, so a gate that lets one through can't overwrite the files the
// other tests read.
function exportFixture(extend) {
  const preset = join(scratch, 'fixture.mjs');
  writeFileSync(
    preset,
    `export const becketPreset = { theme: { extend: ${JSON.stringify(extend)} } };`,
  );
  return spawnSync(
    process.execPath,
    [
      script,
      '--preset',
      preset,
      '--manifest',
      join(scratch, 'fixture-manifest.json'),
      '--tokens-json',
      join(scratch, 'fixture-tokens.json'),
    ],
    { encoding: 'utf8' },
  );
}

test('ten sample tokens map to the expected Panda, CSS, Figma and artifact names', () => {
  for (const [panda, css, figma, artifact] of [
    ['colors.neutral.50', '--beckui--colors-neutral-50', 'colors/neutral/50', 'neutral-50'],
    [
      'colors.brand.becketYellow',
      '--beckui--colors-brand-becket-yellow',
      'colors/brand/becketYellow',
      'brand-becketYellow',
    ],
    ['colors.primary', '--beckui--colors-primary', 'colors/primary', 'primary'],
    ['colors.background', '--beckui--colors-background', 'colors/background', 'background'],
    ['spacing.3', '--beckui--spacing-3', 'spacing/3', 'space-3'],
    ['spacing.md', '--beckui--spacing-md', 'spacing/md', 'space-md'],
    ['sizes.13', '--beckui--sizes-13', 'sizes/13', 'size-13'],
    ['radii.md', '--beckui--radii-md', 'radii/md', 'radius-md'],
    ['shadows.elevated', '--beckui--shadows-elevated', 'shadows/elevated', 'shadow-elevated'],
    ['breakpoints.md', '--beckui--breakpoints-md', 'breakpoints/md', 'breakpoint-md'],
  ]) {
    const entry = manifest.find((candidate) => candidate.panda === panda);
    assert.deepEqual(
      { panda: entry.panda, css: entry.css, figma: entry.figma, artifact: entry.artifact },
      { panda, css, figma, artifact },
    );
  }
});

test('tokens a target cannot hold have no name there', () => {
  for (const [panda, figma, artifact] of [
    // Type-scale steps reach the artifact as type styles, not as flat tokens.
    ['fontSizes.lg', 'fontSizes/lg', null],
    ['fontSizes.text-lg', null, null],
    ['spacing.text-3', null, 'space-text-3'],
    ['sizes.prose', null, 'size-prose'],
    ['shadows.outline', null, null],
    ['colors.lightBackground', null, null],
  ]) {
    const entry = manifest.find((candidate) => candidate.panda === panda);
    assert.deepEqual({ figma: entry.figma, artifact: entry.artifact }, { figma, artifact }, panda);
  }
});

test('calc and color-mix values are resolved', () => {
  const spacing = manifest.find((entry) => entry.panda === 'spacing.3');
  assert.deepEqual([spacing.dark, spacing.source], ['0.75rem', 'calc({spacing.unit} * 3)']);
  assert.equal(
    manifest.find((entry) => entry.panda === 'colors.primaryHover').dark,
    'oklch(0.78 0.132 78)',
  );
});

test('primaryHover passes the self-test against linkHover.base', () => {
  assert.match(
    run.stdout,
    /self-test: primaryHover oklch\(0\.78 0\.132 78\) vs linkHover\.base oklch\(0\.78 0\.13 78\)/,
  );
});

test('every manifest CSS name is declared in index.css and artifact names are unique', () => {
  // style-check keep: inlining would read index.css again for every manifest entry.
  const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
  assert.deepEqual(
    manifest.filter((entry) => !css.includes(`${entry.css}:`)).map((entry) => entry.panda),
    [],
  );
  const names = manifest.flatMap((entry) => (entry.artifact ? [entry.artifact] : []));
  assert.equal(new Set(names).size, names.length);
});

test('the artifact list stays inside the artifact grammar', () => {
  const list = JSON.parse(readFileSync(join(scratch, 'tokens.json'), 'utf8'));
  for (const token of [
    list.color,
    list.spacing,
    list.size,
    list.radius,
    list.shadow,
    list.breakpoint,
  ].flatMap((family) => family.tokens)) {
    assert.match(token.name, /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/);
    assert.ok(token.usage, `${token.name} has a usage line`);
    assert.doesNotMatch(JSON.stringify(token.value), /var\(|calc\(|color-mix\(/);
  }
  assert.deepEqual(list.color.tokens.find((token) => token.name === 'background').value, {
    dark: '{neutral-900}',
    light: '{neutral-50}',
  });
});

test('a fixture with a broken alias exits 1 and names the token', () => {
  const fixture = exportFixture({
    tokens: { colors: { primary: { value: '{colors.missing}' } } },
    semanticTokens: {},
    breakpoints: {},
  });
  assert.equal(fixture.status, 1);
  assert.match(fixture.stderr, /colors\.primary: alias \{colors\.missing\} does not resolve/);
});

test('an expression the resolver does not understand exits 1 and names the token', () => {
  for (const expression of ['calc({spacing.unit} * -1)', 'calc({spacing.unit} + 2px)']) {
    const fixture = exportFixture({
      tokens: { spacing: { unit: { value: '0.25rem' }, odd: { value: expression } } },
      semanticTokens: {},
      breakpoints: {},
    });
    assert.equal(fixture.status, 1, expression);
    assert.match(fixture.stderr, /spacing\.odd: unsupported expression/, expression);
  }
});

test('a primaryHover that drifts from linkHover.base fails the self-test', () => {
  const fixture = exportFixture({
    tokens: {
      colors: {
        primary: { value: 'oklch(0.75 0.15 78)' },
        primaryHover: { value: 'color-mix(in oklch, {colors.primary} 50%, white)' },
      },
    },
    semanticTokens: {
      colors: {
        linkHover: { value: { base: 'oklch(0.78 0.13 78)', _light: 'oklch(0.46 0.11 70)' } },
      },
    },
    breakpoints: {},
  });
  assert.equal(fixture.status, 1);
  assert.match(fixture.stderr, /self-test failed: primaryHover resolves to/);
});

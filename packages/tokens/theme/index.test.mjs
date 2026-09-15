import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { defineBecketTheme } from './index.mjs';

const tokensRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('defineBecketTheme maps primary and sizes.field to public CSS vars', () => {
  const css = defineBecketTheme({
    colors: { primary: 'oklch(0.55 0.22 280)' },
    sizes: { field: '16rem' },
  });
  assert.match(css, /^:root \{/);
  assert.match(css, /--beckui--colors-primary: oklch\(0\.55 0\.22 280\);/);
  assert.match(css, /--beckui--sizes-field: 16rem;/);
  assert.doesNotMatch(css, /brand-becket-yellow/);
});

test('defineBecketTheme maps background { dark, light } onto one semantic var', () => {
  const css = defineBecketTheme({
    colors: {
      background: { dark: 'oklch(0.2 0.02 260)', light: 'oklch(0.98 0.01 260)' },
    },
  });
  assert.match(css, /:root \{[\s\S]*--beckui--colors-background: oklch\(0\.2 0\.02 260\);/);
  assert.match(
    css,
    /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-background: oklch\(0\.98 0\.01 260\);/,
  );
  assert.doesNotMatch(css, /light-background/);
});

test('defineBecketTheme maps danger { dark, light } onto one semantic var', () => {
  const css = defineBecketTheme({
    colors: {
      danger: { dark: 'oklch(0.76 0.16 25)', light: 'oklch(0.48 0.20 25)' },
    },
  });
  assert.match(css, /:root \{[\s\S]*--beckui--colors-danger: oklch\(0\.76 0\.16 25\);/);
  assert.match(
    css,
    /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-danger: oklch\(0\.48 0\.20 25\);/,
  );
});

test('defineBecketTheme density vars do not touch spacing tokens', () => {
  const css = defineBecketTheme({
    density: { button: { md: { px: '0.4rem', py: '0.1rem' } } },
  });
  assert.match(css, /--beckui-button-px-md: 0\.4rem;/);
  assert.match(css, /--beckui-button-py-md: 0\.1rem;/);
  assert.doesNotMatch(css, /--beckui--spacing-md/);
});

test('defineBecketTheme rejects unknown keys', () => {
  assert.throws(
    () => defineBecketTheme({ colors: { highlight: 'red' } }),
    /Unknown Becket theme key "colors.highlight"/,
  );
});

test('generated index.css semantic text/background follow data-theme', () => {
  const css = readFileSync(join(tokensRoot, 'index.css'), 'utf8');
  assert.match(css, /--beckui--colors-text:/);
  assert.match(css, /--beckui--colors-background:/);
  assert.match(css, /\[data-theme=['"]light['"]\]/);
  assert.match(css, /--beckui-button-px-md:\s*1rem/);
  assert.match(css, /--beckui-field-px-md:\s*0\.75rem/);
  assert.match(css, /--beckui-tag-px-md:\s*0\.75rem/);
  assert.match(
    css,
    /--beckui--shadows-outline:\s*0 0 0 2px var\(--beckui--colors-background\), 0 0 0 4px var\(--beckui--colors-primary\)/,
  );
});

test('package.json exports ./theme for Storybook and Vite conditions', () => {
  const pkg = JSON.parse(readFileSync(join(tokensRoot, 'package.json'), 'utf8'));
  const theme = pkg.exports['./theme'];
  assert.equal(theme.types, './theme/index.d.ts');
  for (const condition of ['storybook', 'module', 'browser', 'import', 'default']) {
    assert.equal(theme[condition], './theme/index.mjs', condition);
  }
});

test('theme.example.css documents the public primary / field / radius contract', () => {
  const css = readFileSync(join(tokensRoot, 'theme.example.css'), 'utf8');
  assert.match(css, /--beckui--colors-primary:/);
  assert.match(css, /--beckui--sizes-field:/);
  assert.match(css, /--beckui--radii-md:/);
  assert.match(css, /--beckui-button-px-md:/);
});

test('empty config does not emit :root overrides', () => {
  const css = defineBecketTheme({});
  assert.doesNotMatch(css, /:root/);
});

test('generated index.css alias graph follows primary / tertiary / secondary', () => {
  const css = readFileSync(join(tokensRoot, 'index.css'), 'utf8');
  assert.match(
    css,
    /--beckui--colors-primary-hover:\s*color-mix\(in oklch, var\(--beckui--colors-primary\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-primary:\s*linear-gradient\(to right, var\(--beckui--colors-primary\), var\(--beckui--colors-tertiary\)\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-secondary:\s*linear-gradient\(to right, var\(--beckui--colors-primary\), var\(--beckui--colors-secondary\)\)/,
  );
  assert.match(
    css,
    /--beckui--gradients-primary-hover:\s*linear-gradient\(to right, var\(--beckui--colors-primary-hover\), var\(--beckui--colors-tertiary\)\)/,
  );
  assert.doesNotMatch(
    css,
    /--beckui--colors-primary-hover:[^;]*brand-becket-yellow/,
  );
});

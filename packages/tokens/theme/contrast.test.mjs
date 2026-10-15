import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { colorDistance, contrastRatio, formatOklch, parseColor, toGamut } from './color.mjs';
import {
  CONTRAST_PAIRS,
  DEFAULT_COLORS,
  checkBecketThemeContrast,
  resolveBecketColors,
} from './contrast.mjs';

/**
 * WCAG 2.2 AA contrast for the pairs Becket draws, in both themes. The checker's defaults are
 * compared with the built index.css first, so the test can't pass against stale values.
 */
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');

function block(selector) {
  const start = css.indexOf(selector);
  assert.ok(start >= 0, `index.css has no ${selector} block`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

const vars = (text) =>
  Object.fromEntries(
    [...text.matchAll(/(--beckui--[\w-]+):\s*([^;}]+);?/g)].map(([, n, v]) => [n, v.trim()]),
  );
const cssDark = vars(block(':where(:root, :host) {'));
const cssLight = { ...cssDark, ...vars(block("[data-theme='light'] {")) };

const kebab = (key) => key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace('.', '-');

function cssColor(table, name, depth = 0) {
  const value = table[`--beckui--colors-${name}`];
  assert.ok(value, `missing --beckui--colors-${name}`);
  const nested = value.match(/^var\(--beckui--colors-([\w-]+)\)$/);
  if (nested && depth < 6) return cssColor(table, nested[1], depth + 1);
  const mix = value.match(
    /^color-mix\(in oklch, var\(--beckui--colors-([\w-]+)\) (\d+)%, white\)$/,
  );
  if (mix) {
    const base = cssColor(table, mix[1], depth + 1);
    const amount = Number(mix[2]) / 100;
    return { L: base.L * amount + (1 - amount), C: base.C * amount, h: base.h };
  }
  const color = parseColor(value);
  assert.ok(color, `can't read --beckui--colors-${name}: ${value}`);
  return color;
}

const defaults = resolveBecketColors();
for (const [mode, table] of [
  ['dark', cssDark],
  ['light', cssLight],
]) {
  test(`${mode}: the checker's default colors match index.css`, () => {
    for (const key of Object.keys(DEFAULT_COLORS.dark)) {
      const fromCss = cssColor(table, kebab(key));
      assert.ok(
        colorDistance(defaults[mode][key], fromCss) < 1e-6,
        `${key}: checker ${formatOklch(defaults[mode][key])}, index.css ${formatOklch(fromCss)}`,
      );
    }
  });
}

const report = checkBecketThemeContrast();
for (const result of report.results.filter((each) => each.level === 'required')) {
  test(`${result.theme}: ${result.foreground} on ${result.background} is at least ${result.minimum}:1`, () => {
    assert.ok(result.passes, `${result.use} (${result.theme}) is ${result.ratio}:1`);
  });
}

test('advisory pairs are the known default gaps, and only those', () => {
  const failing = report.advisories.map(
    (result) => `${result.theme}:${result.foreground}/${result.background}`,
  );
  assert.deepEqual(failing.toSorted(), [
    'dark:neutral.900/tertiary',
    'light:neutral.900/tertiary',
    'light:primary/background',
    'light:primary/surface',
  ]);
  assert.equal(report.passes, true);
});

test('every pair names tokens the resolver knows', () => {
  for (const pair of CONTRAST_PAIRS) {
    assert.ok(
      defaults.dark[pair.foreground] && defaults.dark[pair.background],
      `${pair.foreground}/${pair.background}`,
    );
  }
});

test('contrastRatio: black on white is 21:1, a color on itself is 1:1', () => {
  assert.equal(Number(contrastRatio('#000', '#fff').toFixed(2)), 21);
  assert.equal(contrastRatio('#777777', '#777777'), 1);
  // WebAIM reference: #767676 on white is 4.54:1.
  assert.equal(Number(contrastRatio('#767676', '#ffffff').toFixed(2)), 4.54);
});

test('parseColor: hex, rgb(), hsl() and oklch() give the same ratio for the same color', () => {
  const formats = [
    '#0a3d91',
    '#0A3D91',
    'rgb(10, 61, 145)',
    'rgb(10 61 145 / 50%)',
    'hsl(217.33 87.1% 30.39%)',
    formatOklch(parseColor('#0a3d91')),
  ];
  const ratios = formats.map((format) => contrastRatio(format, '#ffffff'));
  for (const ratio of ratios) assert.ok(Math.abs(ratio - ratios[0]) < 0.01, `${ratios.join(', ')}`);
});

test('parseColor: unsupported input returns null, and contrastRatio says what it accepts', () => {
  assert.equal(parseColor('papayawhip'), null);
  assert.equal(parseColor('#12345'), null);
  assert.throws(() => contrastRatio('brand-blue', '#fff'), /hex, rgb\(\), hsl\(\) or oklch\(\)/);
});

test('toGamut lowers chroma only, and out-of-gamut colors still get a ratio', () => {
  const wild = parseColor('oklch(0.7 0.4 150)');
  const mapped = toGamut(wild);
  assert.equal(mapped.L, wild.L);
  assert.equal(mapped.h, wild.h);
  assert.ok(mapped.C < wild.C);
  assert.ok(contrastRatio(wild, '#000') > 1);
});

test('a theme that fails says which pair and by how much', () => {
  const failing = checkBecketThemeContrast({ colors: { primary: '#0a3d91' } });
  assert.equal(failing.passes, false);
  const label = failing.failures.find(
    (result) => result.background === 'primary' && result.theme === 'dark',
  );
  assert.ok(label && label.ratio < 4.5, JSON.stringify(failing.failures));
});

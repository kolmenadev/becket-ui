import assert from 'node:assert/strict';
import { test } from 'node:test';

import { colorDistance, parseColor } from './color.mjs';
import { checkBecketThemeContrast } from './contrast.mjs';
import { deriveBecketTheme } from './derive.mjs';
import { defineBecketTheme } from './index.mjs';

const palettes = {
  'dark navy': ['#0a3d91'],
  neon: ['#39ff14', '#ff00ff'],
  pastel: ['#ffd1dc', '#c1e1c1', '#aec6cf'],
  'near-black': ['#111111'],
  'near-white': ['#fafafa'],
  'red as primary': ['#d0021b', '#222222'],
  mono: ['#808080'],
  'deep purple': ['oklch(0.35 0.18 300)'],
  'bright yellow': ['#ffcc00', '#003366'],
  'teal and coral': ['rgb(0 128 128)', 'hsl(16 100% 66%)', '#2f4858'],
  'forest green': ['#228b22'],
  'out of gamut': ['oklch(0.7 0.4 150)'],
};

for (const [name, brand] of Object.entries(palettes)) {
  test(`${name}: the derived theme passes AA in both themes`, () => {
    const { theme, contrast, notes } = deriveBecketTheme({ brand });
    assert.equal(
      contrast.passes,
      true,
      contrast.failures
        .map((failure) => `${failure.theme} ${failure.use}: ${failure.ratio}`)
        .join('\n'),
    );
    // The report is the checker's own verdict, not a copy.
    assert.deepEqual(checkBecketThemeContrast(theme), contrast);
    assert.ok(notes.some((note) => note.token === 'primary'));
  });
}

test('the brand hue never changes, only lightness and chroma', () => {
  const seed = parseColor('#0a3d91');
  const { theme } = deriveBecketTheme({ brand: ['#0a3d91'] });
  for (const value of [theme.colors.primary, theme.colors.link.dark, theme.colors.link.light]) {
    assert.ok(Math.abs(parseColor(value).h - seed.h) < 0.5, value);
  }
});

test('a brand color that already passes is used exactly', () => {
  const { theme, notes } = deriveBecketTheme({ brand: ['#0a3d91'] });
  assert.ok(colorDistance(parseColor(theme.colors.link.light), parseColor('#0a3d91')) < 0.001);
  assert.match(notes.find((note) => note.token === 'link').reason, /used as is in light/);
  const yellow = deriveBecketTheme({ brand: ['#ffcc00'] });
  assert.ok(colorDistance(parseColor(yellow.theme.colors.primary), parseColor('#ffcc00')) < 0.001);
});

test('pinned values are kept exactly, and a failing one is reported with its ratio', () => {
  const { theme, contrast, notes } = deriveBecketTheme({
    brand: ['#0a3d91'],
    pinned: { primary: '#0a3d91' },
  });
  assert.equal(theme.colors.primary, '#0a3d91');
  assert.match(
    notes.find((note) => note.token === 'primary' && /Pinned/.test(note.reason)).reason,
    /kept exactly/,
  );
  assert.equal(contrast.passes, false);
  const label = contrast.failures.find((failure) => failure.background === 'primary');
  assert.ok(label.ratio < 4.5);
});

test('a pinned canvas moves the colors on it, not the canvas', () => {
  const pinned = { background: { dark: 'oklch(0.3 0.05 260)', light: 'oklch(0.99 0.01 260)' } };
  const { theme, contrast } = deriveBecketTheme({ brand: ['#3366ff'], pinned });
  assert.deepEqual(theme.colors.background, pinned.background);
  assert.equal(contrast.passes, true, JSON.stringify(contrast.failures));
});

test('the output passes straight to defineBecketTheme', () => {
  const { theme } = deriveBecketTheme({ brand: ['#0a3d91', '#f5a623'] });
  const css = defineBecketTheme(theme);
  assert.match(css, /--beckui--colors-primary: oklch\(/);
  assert.match(css, /html\[data-theme='light'\] \{[\s\S]*--beckui--colors-link: oklch\(/);
});

test('same input, same output', () => {
  assert.deepEqual(
    deriveBecketTheme({ brand: ['#0a3d91', '#f5a623'] }),
    deriveBecketTheme({ brand: ['#0a3d91', '#f5a623'] }),
  );
});

test('bad input says what to pass', () => {
  assert.throws(() => deriveBecketTheme({ brand: [] }), /one to three brand colors/);
  assert.throws(() => deriveBecketTheme({ brand: ['a', 'b', 'c', 'd'] }), /one to three/);
  assert.throws(
    () => deriveBecketTheme({ brand: ['brand blue'] }),
    /Can't read the brand color "brand blue"/,
  );
});

test('a red brand gets a note about danger', () => {
  const { notes } = deriveBecketTheme({ brand: ['#d0021b'] });
  assert.ok(notes.some((note) => note.token === 'danger'));
});

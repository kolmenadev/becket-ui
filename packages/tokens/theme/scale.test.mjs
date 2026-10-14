import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Recipes stay on Becket's scales (see "Sizing and spacing" in .cursor-config/becket.mdc).
 * Panda's default preset still defines off-scale keys such as sizes-10 or spacing-6, so they
 * compile silently; this reads the built recipe CSS and fails on them and on raw lengths.
 */
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');
const recipes = css.slice(css.indexOf('@layer recipes{'), css.indexOf('@layer utilities{'));

const FIBONACCI = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55'];
const SEMANTIC_SPACING = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
// Named widths for panels and containers, plus the intrinsic keywords.
const LAYOUT_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', 'prose', 'full', 'min', 'max', 'fit', 'field'];
const ALLOWED = {
  spacing: new Set([...FIBONACCI, ...SEMANTIC_SPACING]),
  sizes: new Set([...FIBONACCI, ...LAYOUT_SIZES]),
};

test('recipes only use Fibonacci, semantic or named layout keys for spacing and sizes', () => {
  const offScale = [...recipes.matchAll(/var\(--beckui--(spacing|sizes)-([\w-]+)\)/g)]
    .filter(([, scale, key]) => !ALLOWED[scale].has(key))
    .map(([reference]) => reference);
  assert.deepEqual([...new Set(offScale)], []);
});

test('every token a recipe references exists', () => {
  const defined = new Set([...css.matchAll(/(--beckui--[\w-]+):/g)].map(([, name]) => name));
  const missing = [...recipes.matchAll(/var\((--beckui--[\w-]+)\)/g)]
    .map(([, name]) => name)
    .filter((name) => !defined.has(name));
  assert.deepEqual([...new Set(missing)], []);
});

// Borders, rings and shadows are hairlines, not layout. 1px also clips visually hidden text.
const HAIRLINE_PROPERTY = /^(border|outline|box-shadow|text-decoration|text-underline|--)/;
// WCAG 2.5.8 minimum target size for icon-only buttons.
const TARGET_MINIMUM = /^min-(width|height): 24px$/;

test('recipes use tokens, em or ratios instead of raw rem and px lengths', () => {
  const raw = [...recipes.matchAll(/([\w-]+):\s*([^;{}]+);/g)]
    .map(([, property, value]) => [property, value.trim()])
    .filter(([property]) => !HAIRLINE_PROPERTY.test(property))
    .filter(([property, value]) => !TARGET_MINIMUM.test(`${property}: ${value}`))
    .filter(([, value]) => /(^|[\s(,-])\d*\.?\d+(rem|px)\b/.test(value.replace(/-?1px/g, '')))
    .map(([property, value]) => `${property}: ${value}`);
  assert.deepEqual([...new Set(raw)], []);
});

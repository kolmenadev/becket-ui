import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const fibonacci = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55'];

// Recipes stay on Becket's scales (see "Sizing and spacing" in .cursor-config/becket.mdc).
// Panda's default preset still defines off-scale keys such as sizes-10 or spacing-6, so they
// compile silently; this reads the built recipe CSS and finds them and raw lengths. It's
// exported because scripts/check-tokens.mjs runs the same checks at the end of every build.
export function findScaleProblems(css) {
  // Known gap, kept as it was on main: the built index.css writes `@layer recipes {` and
  // `@layer utilities {` with a space, so both indexOf calls return -1 and this slice is empty.
  // The three recipe checks below find nothing until it's fixed, and check-tokens.mjs says so.
  // Adding the space isn't enough: the first `@layer recipes {` is the layer-order line.
  const recipes = css.slice(css.indexOf('@layer recipes{'), css.indexOf('@layer utilities{'));
  // One variable per scale is enough to resize Becket: spacing, text spacing and type.
  const root = Object.fromEntries(
    [
      ...css.slice(css.indexOf(':where(:root, :host)')).matchAll(/(--beckui--[\w-]+):\s*([^;}]+)/g),
    ].map(([, name, value]) => [name, value.trim()]),
  );
  // style-check keep: built once; inlined into the filter, the sets would be rebuilt for every match.
  const allowed = {
    // Fibonacci steps, semantic gaps, and em-based steps (text-1 to text-13) inside running text.
    spacing: new Set([
      ...fibonacci,
      ...['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      ...fibonacci.slice(1, 7).map((step) => `text-${step}`),
    ]),
    // Fibonacci steps, named widths for panels and containers, and the intrinsic keywords.
    sizes: new Set([
      ...fibonacci,
      ...['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl'],
      ...['prose', 'full', 'min', 'max', 'fit', 'field'],
    ]),
  };
  // style-check keep: built once; inlined into the filter, the set would be rebuilt for every name.
  const defined = new Set([...css.matchAll(/(--beckui--[\w-]+):/g)].map(([, name]) => name));
  return {
    offScaleKeys: [
      ...new Set(
        [...recipes.matchAll(/var\(--beckui--(spacing|sizes)-([\w-]+)\)/g)]
          .filter(([, scale, key]) => !allowed[scale].has(key))
          .map(([reference]) => reference),
      ),
    ],
    missingTokens: [
      ...new Set(
        [...recipes.matchAll(/var\((--beckui--[\w-]+)\)/g)]
          .map(([, name]) => name)
          .filter((name) => !defined.has(name)),
      ),
    ],
    rawLengths: [
      ...new Set(
        [...recipes.matchAll(/([\w-]+):\s*([^;{}]+);/g)]
          .map(([, property, value]) => [property, value.trim()])
          // Borders, rings and shadows are hairlines, not layout. 1px also clips visually hidden text.
          .filter(([property]) => !/^(border|outline|box-shadow|text-decoration|--)/.test(property))
          // WCAG 2.5.8 minimum target size for icon-only buttons.
          .filter(
            ([property, value]) => !/^min-(width|height): 24px$/.test(`${property}: ${value}`),
          )
          .filter(([, value]) =>
            /(^|[\s(,-])\d*\.?\d+(r?em|px)\b/.test(value.replace(/-?1px/g, '')),
          )
          .map(([property, value]) => `${property}: ${value}`),
      ),
    ],
    unlinkedSpacing: [
      ...['spacing', 'sizes'].flatMap((scale) =>
        fibonacci
          .slice(1)
          .filter((step) => scale === 'sizes' || step !== '55')
          .map((step) => [
            `--beckui--${scale}-${step}`,
            `calc(var(--beckui--spacing-unit) * ${step})`,
          ]),
      ),
      ...fibonacci
        .slice(1, 7)
        .map((step) => [
          `--beckui--spacing-text-${step}`,
          `calc(var(--beckui--spacing-text-unit) * ${step})`,
        ]),
    ]
      .filter(([name, expected]) => root[name] !== expected)
      .map(([name]) => `${name}: ${root[name]}`),
    unlinkedTypeScale: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']
      .map((step) => `--beckui--font-sizes-${step}`)
      .filter(
        (name) => !/^calc\(var\(--beckui--font-sizes-base\) \* [\d.]+\)$/.test(root[name] ?? ''),
      )
      .map((name) => `${name}: ${root[name]}`),
    // Radii are in rem so they follow the text size.
    nonRemRadii: ['sm', 'md', 'lg', 'xl']
      .map((step) => `--beckui--radii-${step}`)
      .filter((name) => !/^[\d.]+rem$/.test(root[name] ?? ''))
      .map((name) => `${name}: ${root[name]}`),
  };
}

// The tests register only when node --test runs this file, not when check-tokens.mjs imports it.
// `!== false`: Node 22.12 to 22.17 have no import.meta.main, and the tests must still run there.
if (import.meta.main !== false) {
  const problems = findScaleProblems(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8'),
  );

  test('recipes only use Fibonacci, semantic or named layout keys for spacing and sizes', () => {
    assert.deepEqual(problems.offScaleKeys, []);
  });

  test('every token a recipe references exists', () => {
    assert.deepEqual(problems.missingTokens, []);
  });

  test('recipes use tokens or ratios instead of raw rem, em and px lengths', () => {
    assert.deepEqual(problems.rawLengths, []);
  });

  test('Fibonacci spacing and sizes derive from --beckui--spacing-unit', () => {
    assert.deepEqual(problems.unlinkedSpacing, []);
  });

  test('the type scale derives from --beckui--font-sizes-base', () => {
    assert.deepEqual(problems.unlinkedTypeScale, []);
  });

  test('radii are in rem so they follow the text size', () => {
    assert.deepEqual(problems.nonRemRadii, []);
  });
}

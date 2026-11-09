import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// Forced colors (Windows contrast themes) drop every box-shadow, and Becket draws focus rings with
// one. A focus rule keeps a visible indicator there only if it also sets a real outline, which the
// system repaints in its own color. Reads the built CSS, so shared styles spread into recipes count.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');

test('every recipe focus rule that draws a ring also sets an outline forced colors can paint', () => {
  assert.deepEqual(
    [
      ...css
        .slice(css.indexOf('@layer recipes'), css.indexOf('@layer utilities'))
        .matchAll(/([^{}]+)\{([^{}]*)\}/g),
    ]
      .filter(([, selector]) => /:focus/.test(selector))
      .filter(([, , declarations]) => /box-shadow:|outline:/.test(declarations))
      // `outline: 'none'` in a recipe compiles to the `borders.none` token.
      .filter(([, , declarations]) =>
        /^(none|var\(--beckui--borders-none\))?$/.test(
          declarations.match(/outline:\s*([^;]+);/)?.[1].trim() ?? '',
        ),
      )
      .map(([, selector]) => selector.trim()),
    [],
  );
});

test('the base layer gives :focus-visible an outline in forced colors', () => {
  assert.match(
    css,
    /@media \(forced-colors: active\) \{\s*:focus-visible \{\s*outline: 2px solid Highlight;/,
  );
});

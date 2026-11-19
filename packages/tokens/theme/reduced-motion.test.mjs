import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// jsdom and the node runner apply no CSS, so this reads the built stylesheet. The computed-style
// check in a real browser lives in packages/react (reduced-motion.browser.test.tsx).
// style-check keep: read index.css once; inlined, each test re-reads the file.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');

test('index.css shortens every animation and transition under reduced motion', () => {
  const rule = css.match(
    /@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{([^}]*)\}/,
  );
  assert.ok(rule, 'a reduced-motion rule covers *, ::before and ::after');
  assert.match(rule[1], /animation-duration: 0\.01ms !important/);
  assert.match(rule[1], /animation-iteration-count: 1 !important/);
  assert.match(rule[1], /transition-duration: 0\.01ms !important/);
  assert.match(rule[1], /scroll-behavior: auto !important/);
});

test('the spinner stops rotating under reduced motion', () => {
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\) \{\s*\.beckui--spinner \{\s*animation-name: none;/,
  );
});

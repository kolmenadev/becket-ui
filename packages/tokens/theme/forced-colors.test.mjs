import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// Forced colors repaint background and border into one system color, so a state drawn only with
// those disappears. Reads the built CSS: a `_highContrast` condition is `@media (forced-colors: active)`.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.css'), 'utf8');
const recipes = css.slice(css.indexOf('@layer recipes'), css.indexOf('@layer utilities'));

const forcedColors = [];
let from = 0;
while (from < recipes.length) {
  const start = recipes.indexOf('@media (forced-colors: active) {', from);
  if (start < 0) break;
  let depth = 0;
  let end = start;
  for (let i = recipes.indexOf('{', start); i < recipes.length; i += 1) {
    if (recipes[i] === '{') depth += 1;
    else if (recipes[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  forcedColors.push(recipes.slice(start, end));
  from = end;
}

test('checked, selected and current controls keep a non-color cue in forced colors', () => {
  const rules = forcedColors.join('\n');
  assert.match(rules, /\.beckui--checkbox__control:is\(:checked[^}]*\+ \*/);
  assert.match(rules, /content: "✓"/);
  assert.match(rules, /\.beckui--radio__control:is\(:checked[^}]*\+ \*/);
  assert.match(rules, /content: "●"/);
  assert.match(
    rules,
    /\.beckui--tabs__tab\[aria-selected="true"\][\s\S]*?border-bottom-width: 4px/,
  );
  assert.match(
    rules,
    /\.beckui--pagination__link\[aria-current="page"\][\s\S]*?text-decoration: underline/,
  );
});

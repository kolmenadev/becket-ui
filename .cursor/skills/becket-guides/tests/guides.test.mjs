// The checker, its fixtures and the guides stay in step (MAV-170): every rule links to a section
// that exists, every rule has a fixture, and every ⚙ item in the checklist is a rule.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { checker, root } from './harness.mjs';
import { rules } from './rules.fixtures.mjs';

// style-check keep: a lookup table read inside the loop below; inlined, every pass would rebuild it.
const guides = {
  'CODING-STYLE': 'docs/CODING-STYLE.md',
  'building-with-becket': 'packages/react/guides/building-with-becket.md',
  'becket.mdc': '.cursor-config/becket.mdc',
  'becket-guides': '.cursor/skills/becket-guides/SKILL.md',
};
const labels = [
  ...new Set(
    [...readFileSync(checker, 'utf8').matchAll(/rule(?::|\s*=)\s*'([^']+ § [^']+)'/g)].map(
      ([, label]) => label,
    ),
  ),
];

describe('rule labels', () => {
  it('finds every rule label in the checker', () => {
    assert.ok(labels.length >= 20, `only ${labels.length} labels found`);
  });

  for (const label of labels)
    it(`${label} points to sections that exist`, () => {
      // `CODING-STYLE § Name consistency › Boolean`, or two guides: `a § 3 / b § Styling`.
      for (const part of label.split(' / ')) {
        const [guide, section] = part.includes(' § ')
          ? part.split(' § ')
          : [label.split(' § ')[0], part.replace(/^§ /, '')];
        // Labels are plain text; headings put code in backticks and may use a straight apostrophe.
        const text = readFileSync(join(root, guides[guide]), 'utf8')
          .replaceAll('`', '')
          .replaceAll("'", '’');
        const headings = text.split('\n').filter((line) => /^#{1,4} /.test(line));
        for (const piece of section.split(' › ')) {
          // A numbered section (`§ 3`, `§ 2 Known gaps`) is `## 3.`; the words after it are a heading
          // or a bold lead-in inside it.
          const [, number, words] = piece.match(/^(\d+)?\s*(.*)$/);
          if (number)
            assert.ok(
              headings.some((line) => line.startsWith(`## ${number}.`)),
              `${guide}: no "## ${number}."`,
            );
          if (words)
            assert.ok(
              headings.some((line) => line.includes(words)) || text.includes(`**${words}**`),
              `${guide}: no heading or bold "${words}"`,
            );
        }
      }
    });
});

describe('fixtures', () => {
  it('cover every rule in the checker', () => {
    assert.deepEqual(rules.map(({ rule }) => rule).toSorted(), labels.toSorted());
  });
});

describe('checklist', () => {
  // Each ⚙ item in the checklist, by a phrase from its line, and the rule that checks it.
  const checkedBy = {
    'Avoid hasty abstraction': 'CODING-STYLE § Avoid hasty abstraction',
    'style-check keep': 'becket-guides § Kept on purpose',
    'Prefer to reduce nesting': 'CODING-STYLE § Prefer to reduce nesting',
    'Must not mutate': 'CODING-STYLE § Must not mutate arrays or objects you don’t own',
    'Prefer object parameters':
      'CODING-STYLE § Prefer object parameters when there are more than 2',
    'Imports ⚙': 'CODING-STYLE § Prefer sorted imports',
    'No `get` prefix': 'CODING-STYLE § Avoid implied keywords in function names',
    Initialisms: 'CODING-STYLE § Initialisms',
    'Booleans start with': 'CODING-STYLE § Name consistency › Boolean',
    '(UPPER_SNAKE) ⚙': 'CODING-STYLE § Name consistency',
    'TODO names a ticket': 'CODING-STYLE § TODO comments must have a ticket number',
    'Effects ⚙': 'CODING-STYLE § Use effects only to sync with something outside React',
    'Stable keys': 'CODING-STYLE § Must use stable keys',
    'handlers are `handleX`': 'CODING-STYLE § Name props onX and handlers handleX',
    'No `any`': 'CODING-STYLE § Must not use any',
    'a public constant), with a comment':
      'CODING-STYLE § Must use as const only when you need the literal types',
    'over enums': 'CODING-STYLE § Prefer unions and as const over enums',
    'Every `as` and `!` says why':
      'CODING-STYLE § Prefer inference inside, explicit types at boundaries',
    'lint or TS ignore says why':
      'CODING-STYLE § Must explain when ignoring a lint or TypeScript rule',
    'No literal colors': 'building-with-becket § 3 / becket.mdc § Styling',
    'Stories sit next to the component': 'becket.mdc § Storybook rules',
    'Must use a Becket component':
      'building-with-becket § 2 Must use a Becket component when one exists',
    '`TODO (MAV-…)` ⚙': 'building-with-becket § 2 Known gaps / § 11',
    'Props, then tokens': 'building-with-becket § 3',
  };

  it('ties every ⚙ item to a rule in the checker', () => {
    for (const line of readFileSync(
      join(root, '.cursor/skills/becket-guides/references/checklist.md'),
      'utf8',
    )
      .split('\n')
      // The intro line explains the mark; every other line with one is an item.
      .filter((line) => line.includes('⚙') && !/Rules marked ⚙/.test(line))) {
      const phrase = Object.keys(checkedBy).find((key) => line.includes(key));
      assert.ok(phrase, `no rule mapped for checklist line: ${line.trim()}`);
      assert.ok(
        labels.includes(checkedBy[phrase]),
        `${checkedBy[phrase]} isn't a rule in the checker`,
      );
    }
  });
});

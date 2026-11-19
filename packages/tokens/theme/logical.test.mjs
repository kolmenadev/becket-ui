import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

// Recipes are read as text, not from the compiled CSS: a finding keeps the source line that Panda's
// output hides.
function scan(file, source) {
  return source.split('\n').flatMap((text, index) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(text)) return [];
    const matches = [
      ...text.matchAll(
        /(?<![\w$.-])['"]?(left|right|marginLeft|marginRight|paddingLeft|paddingRight|borderLeft\w*|borderRight\w*|float)['"]?\s*:/g,
      ),
    ].map(([, property]) => property);
    if (/\btextAlign\s*:\s*['"](left|right)['"]/.test(text)) matches.push('textAlign');
    if (/\bbackgroundPosition\s*:\s*['"`][^'"`]*\b(left|right)\b/.test(text)) {
      matches.push('backgroundPosition');
    }
    const translate = text.match(/\btransform\s*:\s*['"`][^'"`]*\b(translateX?)\(/);
    if (translate) matches.push(translate[1]);
    return matches.map((match) => ({ file, line: index + 1, match }));
  });
}

// An entry covers one finding by file and pattern, not by line, so editing a recipe above a
// baselined site doesn't break the test. Two sites with the same pattern need two entries.
function check({ findings, baseline, today }) {
  const problems = [];
  const claimed = new Set();
  for (const { file, line, match } of findings) {
    const entry = baseline.findIndex(
      (candidate, index) =>
        !claimed.has(index) && candidate.file === file && candidate.match === match,
    );
    if (entry === -1) {
      problems.push(`${file}:${line} uses the physical direction ${match}; use a logical property`);
    } else {
      claimed.add(entry);
    }
  }
  baseline.forEach(({ file, match, until }, index) => {
    if (!claimed.has(index)) {
      problems.push(`stale baseline entry: ${file} no longer has ${match}; remove the entry`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) {
      problems.push(
        `baseline entry ${file} ${match} needs an until date as YYYY-MM-DD, got ${until}`,
      );
    } else if (until < today) {
      problems.push(`baseline entry ${file} ${match} expired on ${until}; convert the site`);
    }
  });
  return problems;
}

test('recipes use only logical properties, apart from the dated baseline', () => {
  assert.deepEqual(
    check({
      findings: readdirSync(new URL('../recipes/', import.meta.url))
        .filter((name) => name.endsWith('.ts'))
        .toSorted()
        .flatMap((name) =>
          scan(name, readFileSync(new URL(`../recipes/${name}`, import.meta.url), 'utf8')),
        ),
      baseline: JSON.parse(readFileSync(new URL('logical.baseline.json', import.meta.url), 'utf8')),
      today: new Date().toISOString().slice(0, 10),
    }),
    [],
  );
});

test('scan flags each physical-direction pattern once, with its line', () => {
  assert.deepEqual(
    scan(
      'fixture.recipe.ts',
      [
        'export const fixture = {',
        "  left: 'md',",
        '  right: 0,',
        "  marginLeft: '3',",
        "  marginRight: '3',",
        "  paddingLeft: '3',",
        "  paddingRight: '3',",
        "  borderLeftWidth: '1px',",
        "  borderRightColor: 'border',",
        "  float: 'left',",
        "  textAlign: 'right',",
        "  backgroundPosition: 'right {spacing.3} center',",
        "  transform: 'translateX(10px)',",
        "  _hover: { transform: 'translate(1px, 2px)' },",
        '};',
      ].join('\n'),
    ).map(({ line, match }) => `${line} ${match}`),
    [
      '2 left',
      '3 right',
      '4 marginLeft',
      '5 marginRight',
      '6 paddingLeft',
      '7 paddingRight',
      '8 borderLeftWidth',
      '9 borderRightColor',
      '10 float',
      '11 textAlign',
      '12 backgroundPosition',
      '13 translateX',
      '14 translate',
    ],
  );
});

test('scan passes logical properties, centered values and comments', () => {
  assert.deepEqual(
    scan(
      'fixture.recipe.ts',
      [
        '// left: 0 and paddingRight are fine in a comment',
        'export const fixture = {',
        "  insetInlineStart: 'md',",
        "  paddingInlineEnd: '8',",
        "  textAlign: 'start',",
        "  backgroundPosition: 'center',",
        "  transform: 'translateY(2px)',",
        "  placement: 'left',",
        '};',
      ].join('\n'),
    ),
    [],
  );
});

test('check reports a finding without an entry by file, line and property', () => {
  assert.deepEqual(
    check({
      findings: scan('fixture.recipe.ts', "const a = {};\nconst b = { paddingLeft: '3' };"),
      baseline: [],
      today: '2027-01-01',
    }),
    ['fixture.recipe.ts:2 uses the physical direction paddingLeft; use a logical property'],
  );
});

test('check matches an entry by file and pattern, wherever the line moves', () => {
  assert.deepEqual(
    check({
      findings: scan('fixture.recipe.ts', "paddingLeft: '3',"),
      baseline: [
        { file: 'fixture.recipe.ts', match: 'paddingLeft', reason: 'x', until: '2027-12-31' },
      ],
      today: '2027-01-01',
    }),
    [],
  );
  assert.deepEqual(
    check({
      findings: scan('fixture.recipe.ts', "a: 1,\nb: 2,\npaddingLeft: '3',"),
      baseline: [
        { file: 'fixture.recipe.ts', match: 'paddingLeft', reason: 'x', until: '2027-12-31' },
      ],
      today: '2027-01-01',
    }),
    [],
  );
});

test('check needs one entry for each site of the same pattern', () => {
  assert.deepEqual(
    check({
      findings: scan('fixture.recipe.ts', "textAlign: 'left',\ntextAlign: 'left',"),
      baseline: [
        { file: 'fixture.recipe.ts', match: 'textAlign', reason: 'x', until: '2027-12-31' },
      ],
      today: '2027-01-01',
    }),
    ['fixture.recipe.ts:2 uses the physical direction textAlign; use a logical property'],
  );
});

test('check fails an entry whose site was converted to a logical property', () => {
  assert.deepEqual(
    check({
      findings: scan('fixture.recipe.ts', "paddingInlineEnd: '8',"),
      baseline: [
        { file: 'fixture.recipe.ts', match: 'paddingRight', reason: 'x', until: '2027-12-31' },
      ],
      today: '2027-01-01',
    }),
    ['stale baseline entry: fixture.recipe.ts no longer has paddingRight; remove the entry'],
  );
});

test('check fails an entry past its until date, and one without a valid date', () => {
  const findings = scan('fixture.recipe.ts', "paddingRight: '8',");
  const entry = { file: 'fixture.recipe.ts', match: 'paddingRight', reason: 'x' };
  assert.deepEqual(
    check({ findings, baseline: [{ ...entry, until: '2026-12-31' }], today: '2027-01-01' }),
    ['baseline entry fixture.recipe.ts paddingRight expired on 2026-12-31; convert the site'],
  );
  assert.deepEqual(
    check({ findings, baseline: [{ ...entry, until: '2027-01-01' }], today: '2027-01-01' }),
    [],
  );
  assert.deepEqual(
    check({ findings, baseline: [{ ...entry, until: 'soon' }], today: '2027-01-01' }),
    ['baseline entry fixture.recipe.ts paddingRight needs an until date as YYYY-MM-DD, got soon'],
  );
});

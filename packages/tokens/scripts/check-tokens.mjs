#!/usr/bin/env node
// Runs in `build` (after index.css is written) and again in `prepack`: the publish job runs
// `pnpm build` and no tests, so a contrast or scale regression has to fail here.
import { readFileSync } from 'node:fs';

import { checkBecketThemeContrast, contrastPairs } from '../theme/contrast.mjs';
import { findScaleProblems } from '../theme/scale.test.mjs';

// style-check keep: also read in the failures callback; inlined there, package.json is reread per failure.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const report = checkBecketThemeContrast({}, { version });

console.log(
  [
    ['pair', 'theme', 'ratio', 'minimum', 'level', 'result'],
    ...report.results.map((result) => [
      `${result.foreground} on ${result.background}`,
      result.theme,
      `${result.ratio}:1`,
      `${result.minimum}:1`,
      result.level === 'known-gap'
        ? `known-gap ${result.issue ?? '(no issue)'} until ${result.until ?? '(none)'}`
        : result.level,
      result.passes ? 'pass' : report.knownGaps.includes(result) ? 'known gap' : 'FAIL',
    ]),
  ]
    .map((row, _, rows) =>
      row
        .map((cell, column) => cell.padEnd(Math.max(...rows.map((each) => each[column].length))))
        .join('  ')
        .trimEnd(),
    )
    .join('\n'),
);

const problems = [
  ...report.failures.map((result) => {
    const pair = `${result.foreground} on ${result.background} (${result.theme}) is ${result.ratio}:1, needs ${result.minimum}:1`;
    if (result.level !== 'known-gap') return pair;
    if (!/^MAV-\d+$/.test(result.issue ?? ''))
      return `${pair}: a known gap needs an issue such as MAV-132`;
    if (!/^\d+\.\d+\.\d+$/.test(result.until ?? ''))
      return `${pair}: a known gap needs an until version such as 0.9.0`;
    return `${pair}: known gap ${result.issue} expired at ${result.until} (package is ${version})`;
  }),
  // A known gap that passes in every theme is fixed, so it has to be enforced from now on.
  ...contrastPairs
    .filter(
      (pair) =>
        pair.level === 'known-gap' &&
        report.results
          .filter(
            (result) =>
              result.foreground === pair.foreground && result.background === pair.background,
          )
          .every((result) => result.passes),
    )
    .map((pair) => `${pair.foreground} on ${pair.background} now passes: promote to required`),
  ...Object.entries(
    findScaleProblems(readFileSync(new URL('../index.css', import.meta.url), 'utf8')),
  ).flatMap(([check, found]) => found.map((problem) => `index.css ${check}: ${problem}`)),
];
if (problems.length > 0) {
  console.error(`\nToken checks failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(
  [
    `\n${report.results.length} contrast rows: ${report.failures.length} failures, ${report.knownGaps.length} known gaps.`,
    'Scales: recipes use only scale keys, existing tokens and no raw lengths; the root scales derive from their units.',
  ].join('\n'),
);

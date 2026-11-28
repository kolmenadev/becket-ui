import axe, { type RunOptions } from 'axe-core';

import { axeExceptions } from './exceptions';

function formatViolations(violations: axe.Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    ${node.target.join(' ')} — ${node.failureSummary ?? ''}`)
        .join('\n');
      return `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\n${nodes}`;
    })
    .join('\n\n');
}

export async function assertNoAxeViolations(
  container: Element,
  {
    environment = 'jsdom',
    runOnly,
    failOn,
    onResults,
    ...options
  }: RunOptions & {
    environment?: 'jsdom' | 'browser';
    failOn?: NonNullable<axe.ImpactValue>[];
    onResults?: (results: axe.AxeResults) => void;
  } = {},
): Promise<void> {
  // A narrower runOnly would drop rules without an exception entry, which the standard forbids.
  // Taken out of `options` so not even an empty or undefined one reaches the spread below.
  if (runOnly !== undefined) {
    throw new Error(
      'axe runOnly is fixed by the a11y standard; turn a rule off with an entry in src/exceptions.ts',
    );
  }

  const exceptions = axeExceptions.filter(
    (exception) => exception.scope === environment || exception.scope === 'fragment',
  );

  for (const [rule, setting] of Object.entries(options.rules ?? {})) {
    if (!setting.enabled && !exceptions.some((exception) => exception.rule === rule)) {
      throw new Error(`axe rule ${rule} disabled without an exception entry`);
    }
  }

  // style-check keep: read once, not on every pass of the loop below.
  const today = new Date().toISOString().slice(0, 10);
  for (const exception of exceptions) {
    // ISO dates (UTC) compare as strings; an entry still holds through its expiry day.
    if (exception.expires < today) {
      throw new Error(`axe exception for ${exception.rule} expired on ${exception.expires}`);
    }
  }

  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      // The tag set the a11y standard (§3) requires: Becket's WCAG 2.2 AA bar plus best practices.
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    ...options,
    rules: {
      ...Object.fromEntries(exceptions.map((exception) => [exception.rule, { enabled: false }])),
      ...options.rules,
    },
  });

  // Before any throw, so a caller's report also holds the results that fail.
  onResults?.(results);

  // Incomplete means axe could not decide; it needs a person (or browser axe), not a failure.
  if (results.incomplete.length > 0) {
    console.warn(
      `axe incomplete, check by hand:\n${results.incomplete
        .map((result) => `  ${result.id} (${result.nodes.length} nodes)`)
        .join('\n')}`,
    );
  }

  const failing = results.violations.filter(
    // An impact axe didn't set fails, so a violation is never dropped for lack of one.
    (violation) => !failOn || !violation.impact || failOn.includes(violation.impact),
  );
  if (failing.length < results.violations.length) {
    // One line per rule, as for incomplete; onResults gets the nodes.
    console.warn(
      `axe violations below the failing impacts, reported only:\n${results.violations
        .filter((violation) => !failing.includes(violation))
        .map(
          (violation) =>
            `  ${violation.id} (${violation.impact}, ${violation.nodes.length} nodes): ${violation.help}`,
        )
        .join('\n')}`,
    );
  }

  if (failing.length === 0) {
    return;
  }

  throw new Error(`axe violations:\n${formatViolations(failing)}`);
}

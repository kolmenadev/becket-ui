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
  { environment = 'jsdom', ...options }: RunOptions & { environment?: 'jsdom' | 'browser' } = {},
): Promise<void> {
  // A narrower runOnly would drop rules without an exception entry, which the standard forbids.
  if (options.runOnly) {
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

  // Incomplete means axe could not decide; it needs a person (or browser axe), not a failure.
  if (results.incomplete.length > 0) {
    console.warn(
      `axe incomplete, check by hand:\n${results.incomplete
        .map((result) => `  ${result.id} (${result.nodes.length} nodes)`)
        .join('\n')}`,
    );
  }

  if (results.violations.length === 0) {
    return;
  }

  throw new Error(`axe violations:\n${formatViolations(results.violations)}`);
}

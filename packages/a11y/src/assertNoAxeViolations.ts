import axe, { type RunOptions } from 'axe-core';

/**
 * Rules that need layout or painted styles. jsdom has a DOM, not a renderer.
 * Do not re-enable these here — they belong to Storybook addon-a11y + a manual pass.
 */
export const JSDOM_DISABLED_AXE_RULES: NonNullable<RunOptions['rules']> = {
  'color-contrast': { enabled: false },
  'target-size': { enabled: false },
};

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'] as const;

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

/**
 * Run axe-core on a DOM subtree. Throws if any enabled rule reports a violation.
 */
export async function assertNoAxeViolations(
  container: Element,
  options: RunOptions = {},
): Promise<void> {
  const results = await axe.run(container, {
    runOnly: {
      type: 'tag',
      values: [...DEFAULT_TAGS],
    },
    ...options,
    rules: {
      ...JSDOM_DISABLED_AXE_RULES,
      ...options.rules,
    },
  });

  if (results.violations.length === 0) {
    return;
  }

  throw new Error(`axe violations:\n${formatViolations(results.violations)}`);
}

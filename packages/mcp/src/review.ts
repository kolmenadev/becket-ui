import type { Data } from './data';

export type Finding = { line: number; rule: string; message: string; fix: string };

type Rule = {
  rule: string;
  pattern: RegExp;
  message: string;
  fix: string;
};

/**
 * Line rules from the app-code guide (packages/react/guides/building-with-becket.md).
 * Heuristic on purpose: it flags the patterns agents most often write instead of
 * Becket components; a TODO naming a ticket on the same line acknowledges a known gap.
 */
const LINE_RULES: Rule[] = [
  {
    rule: 'no-chakra',
    pattern: /from\s+['"]@chakra-ui\//,
    message: 'Imports Chakra UI.',
    fix: "Import the equivalent from '@becket-ui/react'; Becket has no provider.",
  },
  {
    rule: 'no-recipe-classes',
    pattern: /beckui--[\w-]+/,
    message: 'Uses a generated .beckui--* class name.',
    fix: 'Use the component and its props; recipe classes are not API.',
  },
  {
    rule: 'no-raw-flex-or-grid',
    pattern: /display\s*:\s*['"]?(?:inline-)?(?:flex|grid)/,
    message: 'Lays out with an inline display: flex/grid style.',
    fix: 'Use VStack / HStack / Flex (flex) or SimpleGrid (grid) with gap="xs|sm|md|lg|xl".',
  },
  {
    rule: 'no-raw-heading',
    pattern: /<h[1-6][\s>]/,
    message: 'Uses a raw h1–h6 element.',
    fix: 'Use <Heading as="h1" size="2xl"> (as sets the level, size sets the look).',
  },
  {
    rule: 'no-raw-text',
    pattern: /<(?:p|span)\s[^>]*style=\{\{[^}]*(?:fontSize|fontWeight|color)\s*:/,
    message: 'Styles text with an inline style on p/span.',
    fix: 'Use <Text fontSize="sm" color="muted">, or <Text as="strong"> for bold.',
  },
  {
    rule: 'no-raw-divider',
    pattern: /<hr[\s/>]|height\s*:\s*1(?:px)?\s*[,}]/,
    message: 'Draws a divider with hr or a 1px element.',
    fix: 'Use <Separator /> (orientation="vertical" inside a row).',
  },
  {
    rule: 'no-raw-controls',
    pattern: /<(?:button|input|select|textarea)[\s>/]/,
    message: 'Uses a raw form control.',
    fix: 'Use Button, TextField / Field + FieldControl, Select, Textarea, Checkbox, RadioGroup + Radio or Switch.',
  },
  {
    rule: 'no-color-literals',
    pattern: /['"`]#[0-9a-fA-F]{3,8}['"`]|\b(?:rgb|rgba|hsl|hsla)\(/,
    message: 'Uses a literal color.',
    fix: 'Use tokens: color="muted" on Text, or var(--beckui--colors-<token>) in your own CSS (see get_theme).',
  },
  {
    rule: 'no-pixel-spacing',
    pattern: /\b(?:gap|padding|margin|rowGap|columnGap)(?:Top|Bottom|Left|Right|Inline|Block)?\s*:\s*(?:['"]?\d+(?:px)?['"]?)\s*[,}]/,
    message: 'Sets spacing in pixels.',
    fix: 'Use gap="xs|sm|md|lg|xl" on layout components, or var(--beckui--spacing-<token>) in your own CSS.',
  },
  {
    rule: 'theme-at-root',
    pattern: /data-theme=/,
    message: 'Sets data-theme on an element in JSX.',
    fix: 'Set the theme once on <html data-theme="dark|light"> at the app root.',
  },
];

/** Imports from '@becket-ui/react' that aren't public exports. */
function unknownImports(code: string, data: Data): Finding[] {
  const known = new Set([
    ...data.catalog.components.flatMap((component) => [...component.exports, ...component.hooks, ...component.types]),
    ...data.catalog.helpers.flatMap((helper) => [...helper.exports, ...helper.types]),
  ]);
  const findings: Finding[] = [];
  const statement = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@becket-ui\/react['"]/g;
  for (const match of code.matchAll(statement)) {
    const line = code.slice(0, match.index).split('\n').length;
    for (const raw of match[1].split(',')) {
      const name = raw.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0].trim();
      if (name && !known.has(name)) {
        findings.push({
          line,
          rule: 'unknown-export',
          message: `"${name}" is not exported by @becket-ui/react.`,
          fix: 'Check list_components; compose existing components instead of inventing one.',
        });
      }
    }
  }
  return findings;
}

export function reviewUsage(code: string, data: Data): Finding[] {
  const findings: Finding[] = [];
  code.split('\n').forEach((text, index) => {
    if (/TODO\s*\(MAV-\d+\)/.test(text)) return;
    for (const rule of LINE_RULES) {
      if (rule.pattern.test(text)) findings.push({ line: index + 1, rule: rule.rule, message: rule.message, fix: rule.fix });
    }
  });
  return [...findings, ...unknownImports(code, data)].sort((a, b) => a.line - b.line);
}

export function formatReview(findings: Finding[]): string {
  if (findings.length === 0) {
    return 'No issues found. The code follows the Becket app-code guide for everything this check covers (layout, text, controls, colors, spacing, theme, imports).';
  }
  const rows = findings.map((finding) => `- line ${finding.line} [${finding.rule}] ${finding.message} Fix: ${finding.fix}`);
  return `${findings.length} issue(s):\n${rows.join('\n')}\n\nFix them and run review_usage again. A line with "TODO (MAV-…)" is treated as an acknowledged gap.`;
}

import {
  checkBecketThemeContrast,
  defineBecketTheme,
  deriveBecketTheme,
  type BecketContrastReport,
  type BecketTheme,
  type BecketThemeColors,
} from '@becket-ui/tokens/theme';

/** Every token group set_theme accepts, as plain strings so agents can pass what users say. */
export type SetThemeInput = {
  /** One to three brand colors, most important first. Becket derives the rest. */
  brand?: string[];
  /** Exact color tokens. Kept as given (with `brand`) and checked like every other color. */
  colors?: Record<string, string | Record<string, string>>;
  fonts?: Record<string, string>;
  radii?: Record<string, string>;
  fontSizes?: Record<string, string>;
  spacing?: Record<string, string>;
  sizes?: Record<string, string>;
  density?: Record<string, Record<string, { px?: string; py?: string }>>;
};

type Note = { token: string; reason: string };

const GROUPS = ['colors', 'fonts', 'radii', 'fontSizes', 'spacing', 'sizes', 'density'] as const;

/** What people call Becket tokens, mapped to the real key. */
const ALIASES: Record<string, string> = {
  'colors.brand': 'brand (a top-level list of one to three colors)',
  'colors.main': 'colors.primary',
  'colors.primaryColor': 'colors.primary',
  'colors.secondaryColor': 'colors.secondary',
  'colors.bg': 'colors.background',
  'colors.backgroundColor': 'colors.background',
  'colors.foreground': 'colors.text',
  'colors.textColor': 'colors.text',
  'colors.error': 'colors.danger',
  'colors.gray': 'colors.neutral',
  'colors.grey': 'colors.neutral',
  'fonts.body': 'fonts.sans',
  'fonts.heading': 'fonts.sans (Becket uses one sans family for headings and body)',
  'fonts.code': 'fonts.mono',
  'radii.default': 'radii.md',
  'fontSizes.root': 'fontSizes.base',
  'spacing.base': 'spacing.unit',
};

const GENERIC_FAMILIES = ['sans-serif', 'serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-monospace', 'ui-serif', 'cursive', 'fantasy'];
const FALLBACK = { sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" };

/** px → rem (or em for the text unit) so browser text-size settings keep working (WCAG 1.4.4). */
function toRelative(value: string, unit: 'rem' | 'em') {
  const match = value.trim().match(/^(-?\d*\.?\d+)px$/);
  if (!match) return null;
  return `${Number((Number(match[1]) / 16).toFixed(4))}${unit}`;
}

function withFallback(family: string, kind: 'sans' | 'mono') {
  const names = family.split(',').map((name) => name.trim()).filter(Boolean);
  const quoted = names.map((name) => (/^['"]/.test(name) || !/\s/.test(name) || GENERIC_FAMILIES.includes(name) ? name : `'${name}'`));
  if (names.some((name) => GENERIC_FAMILIES.includes(name.toLowerCase()))) return { value: quoted.join(', '), added: false };
  return { value: [...quoted, FALLBACK[kind]].join(', '), added: true };
}

function nearMiss(path: string) {
  if (ALIASES[path]) return ALIASES[path];
  const [group] = path.split('.');
  const allowed: Record<string, string[]> = {
    colors: ['primary', 'secondary', 'tertiary', 'primaryHover', 'background', 'text', 'muted', 'border', 'danger', 'accent', 'surface', 'link', 'linkHover', 'linkVisited', 'warning', 'success', 'neutral'],
    fonts: ['sans', 'mono'],
    radii: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
    fontSizes: ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
    spacing: ['unit', 'textUnit', 'xs', 'sm', 'md', 'lg', 'xl'],
    sizes: ['field'],
  };
  const options = allowed[group];
  return options ? `one of ${options.map((key) => `${group}.${key}`).join(', ')}` : `one of ${GROUPS.join(', ')}`;
}

/** Relative lengths, fallback fonts. Returns the cleaned groups and what changed. */
function normalize(input: SetThemeInput) {
  const notes: Note[] = [];
  const theme: BecketTheme = {};

  for (const [group, unit] of [['spacing', 'rem'], ['fontSizes', 'rem'], ['radii', 'rem']] as const) {
    const values = input[group];
    if (!values) continue;
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      const relative = toRelative(value, group === 'spacing' && key === 'textUnit' ? 'em' : unit);
      cleaned[key] = relative ?? value;
      if (relative) notes.push({ token: `${group}.${key}`, reason: `${value} written as ${relative} so browser text-size settings still scale it (WCAG 1.4.4).` });
    }
    Object.assign(theme, { [group]: cleaned });
  }

  if (input.fonts) {
    const fonts: Record<string, string> = {};
    for (const [key, family] of Object.entries(input.fonts)) {
      if (key !== 'sans' && key !== 'mono') {
        fonts[key] = family;
        continue;
      }
      const { value, added } = withFallback(family, key);
      fonts[key] = value;
      if (added) notes.push({ token: `fonts.${key}`, reason: `System fallbacks added after ${family}, so text renders before (or without) the webfont.` });
    }
    theme.fonts = fonts;
    notes.push({ token: 'fonts', reason: 'Becket only names the font. Load the webfont in your app (@font-face or your font host) and check its license covers the web.' });
  }

  if (input.sizes) theme.sizes = input.sizes;
  if (input.density) theme.density = input.density as BecketTheme['density'];
  return { theme, notes };
}

function formatContrast(report: BecketContrastReport) {
  const row = (result: BecketContrastReport['results'][number]) =>
    `| ${result.theme} | ${result.use} | ${result.ratio}:1 | ${result.minimum}:1 | ${result.passes ? 'pass' : result.level === 'advisory' ? 'advisory' : '**FAIL**'} |`;
  const required = report.results.filter((result) => result.level === 'required');
  const lines = [
    report.passes
      ? `All ${required.length} required pairs pass WCAG 2.2 AA in dark and light.`
      : `${report.failures.length} of ${required.length} required pairs FAIL WCAG 2.2 AA. Don't ship this theme as is.`,
  ];
  if (report.failures.length || report.advisories.length) {
    lines.push('', '| theme | where | ratio | needs | result |', '| --- | --- | --- | --- | --- |', ...[...report.failures, ...report.advisories].map(row));
  }
  if (report.advisories.length) {
    lines.push('', `Advisory rows aren't enforced because Becket's own default theme misses them too, but fix them when you can: ${[...new Set(report.advisories.map((result) => result.note))].join(' ')}`);
  }
  return lines.join('\n');
}

export function setTheme(input: SetThemeInput): string {
  const given = GROUPS.filter((group) => input[group] && Object.keys(input[group]).length > 0);
  if (!input.brand?.length && given.length === 0) {
    return `Nothing to set. Pass brand colors (\`brand: ["#0a3d91"]\`) and/or exact tokens: ${GROUPS.join(', ')}. To start from a logo, image URL or brand manual, call suggest_theme first.`;
  }

  const { theme, notes } = normalize(input);
  let contrast: BecketContrastReport;
  try {
    if (input.brand?.length) {
      const derived = deriveBecketTheme({ brand: input.brand, pinned: input.colors as BecketThemeColors | undefined });
      theme.colors = derived.theme.colors;
      notes.unshift(...derived.notes);
    } else if (input.colors) {
      theme.colors = input.colors as BecketThemeColors;
    }
    // defineBecketTheme validates every key; run it before the contrast check so typos come first.
    defineBecketTheme(theme);
    contrast = checkBecketThemeContrast(theme);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unknown = message.match(/Unknown Becket theme key "theme\.([^"]+)"|Unknown Becket theme key "([^"]+)"/);
    const path = unknown?.[1] ?? unknown?.[2];
    return path ? `${message}. Did you mean ${nearMiss(path)}? Nothing was generated.` : `${message} Nothing was generated.`;
  }

  const css = defineBecketTheme(theme);
  const sections = [
    `# Becket theme${contrast.passes ? '' : ' (contrast failures, see below)'}`,
    '## Contrast',
    formatContrast(contrast),
    '## Theme CSS',
    `Write this to a file such as \`src/becket-theme.css\` and import it right after \`@becket-ui/tokens/index.css\`. It's unlayered, so it wins over Becket's defaults. Keep \`data-theme\` on <html>.\n\n\`\`\`css\n${css}\`\`\``,
    '## Same theme in code',
    `\`\`\`ts\nimport { defineBecketTheme } from '@becket-ui/tokens/theme';\n\nexport const becketTheme = defineBecketTheme(${JSON.stringify(theme, null, 2)});\n\`\`\`\nInject \`becketTheme\` in a <style> tag after index.css, or keep the CSS file above. Use one, not both.`,
    notes.length ? `## Why each value\n${notes.map((note) => `- ${note.token}: ${note.reason}`).join('\n')}` : null,
    '## Next',
    contrast.passes
      ? "Show the user the brand colors and any value that was shaded for contrast, then write the CSS file. Don't hand-edit colors afterwards; call set_theme again so they stay checked."
      : `Tell the user which pairs fail and why. ${input.brand?.length ? 'Offer to unpin the failing color so Becket shades it,' : 'Offer to pass the color as `brand` instead of an exact token, so Becket shades it,'} or to pick another value, then call set_theme again. Don't write a failing theme without the user's say-so.`,
  ];
  return sections.filter(Boolean).join('\n\n');
}

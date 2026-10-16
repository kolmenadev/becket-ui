import {
  BECKET_PUBLIC_COLOR_KEYS,
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

const groups = ['colors', 'fonts', 'radii', 'fontSizes', 'spacing', 'sizes', 'density'] as const;

export function setTheme(input: SetThemeInput): string {
  if (
    !input.brand?.length &&
    !groups.some((group) => input[group] && Object.keys(input[group]).length > 0)
  ) {
    return `Nothing to set. Pass brand colors (\`brand: ["#0a3d91"]\`) and/or exact tokens: ${groups.join(', ')}. To start from a logo, image URL or brand manual, call suggest_theme first.`;
  }

  const notes: { token: string; reason: string }[] = [];
  const theme: BecketTheme = {};

  // px → rem (em for the text unit), so browser text-size settings still scale it (WCAG 1.4.4).
  for (const group of ['spacing', 'fontSizes', 'radii'] as const) {
    if (!input[group]) continue;
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(input[group])) {
      const px = value.trim().match(/^(-?\d*\.?\d+)px$/);
      cleaned[key] = px
        ? `${Number((Number(px[1]) / 16).toFixed(4))}${group === 'spacing' && key === 'textUnit' ? 'em' : 'rem'}`
        : value;
      if (px) {
        notes.push({
          token: `${group}.${key}`,
          reason: `${value} written as ${cleaned[key]} so browser text-size settings still scale it (WCAG 1.4.4).`,
        });
      }
    }
    theme[group] = cleaned;
  }

  if (input.fonts) {
    const generic = [
      'sans-serif',
      'serif',
      'monospace',
      'system-ui',
      'ui-sans-serif',
      'ui-monospace',
      'ui-serif',
      'cursive',
      'fantasy',
    ];
    const fonts: Record<string, string> = {};
    for (const [key, family] of Object.entries(input.fonts)) {
      const names = family
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
      // Multi-word family names need quotes in CSS; generic families must not have them.
      const quoted = names.map((name) =>
        /^['"]/.test(name) || !/\s/.test(name) || generic.includes(name) ? name : `'${name}'`,
      );
      if (
        (key !== 'sans' && key !== 'mono') ||
        names.some((name) => generic.includes(name.toLowerCase()))
      ) {
        fonts[key] = quoted.join(', ');
        continue;
      }
      fonts[key] = [
        ...quoted,
        key === 'sans'
          ? "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          : "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
      ].join(', ');
      notes.push({
        token: `fonts.${key}`,
        reason: `System fallbacks added after ${family}, so text renders before (or without) the webfont.`,
      });
    }
    theme.fonts = fonts;
    notes.push({
      token: 'fonts',
      reason:
        'Becket only names the font. Load the webfont in your app (@font-face or your font host) and check its license covers the web.',
    });
  }

  if (input.sizes) theme.sizes = input.sizes;
  // Zod already checked the shape; defineBecketTheme below rejects unknown component or size keys.
  if (input.density) theme.density = input.density as BecketTheme['density'];

  let contrast: BecketContrastReport;
  try {
    if (input.brand?.length) {
      const derived = deriveBecketTheme({
        brand: input.brand,
        // Same as above: defineBecketTheme validates the color keys.
        pinned: input.colors as BecketThemeColors | undefined,
      });
      theme.colors = derived.theme.colors;
      notes.unshift(...derived.notes);
    } else if (input.colors) {
      // Same as above: defineBecketTheme validates the color keys.
      theme.colors = input.colors as BecketThemeColors;
    }
    // defineBecketTheme validates every key; run it before the contrast check so typos come first.
    defineBecketTheme(theme);
    contrast = checkBecketThemeContrast(theme);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const path = message.match(/Unknown Becket theme key "(?:theme\.)?([^"]+)"/)?.[1];
    if (!path) return `${message} Nothing was generated.`;
    const [group] = path.split('.');
    const keys: Record<string, readonly string[]> = {
      colors: [...BECKET_PUBLIC_COLOR_KEYS.filter((key) => !key.startsWith('light')), 'neutral'],
      fonts: ['sans', 'mono'],
      radii: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      fontSizes: ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
      spacing: ['unit', 'textUnit', 'xs', 'sm', 'md', 'lg', 'xl'],
      sizes: ['field'],
    };
    return `${message}. Did you mean ${
      // What people call Becket tokens, mapped to the real key; otherwise list the group's keys.
      new Map([
        ['colors.brand', 'brand (a top-level list of one to three colors)'],
        ['colors.main', 'colors.primary'],
        ['colors.primaryColor', 'colors.primary'],
        ['colors.secondaryColor', 'colors.secondary'],
        ['colors.bg', 'colors.background'],
        ['colors.backgroundColor', 'colors.background'],
        ['colors.foreground', 'colors.text'],
        ['colors.textColor', 'colors.text'],
        ['colors.error', 'colors.danger'],
        ['colors.gray', 'colors.neutral'],
        ['colors.grey', 'colors.neutral'],
        ['fonts.body', 'fonts.sans'],
        ['fonts.heading', 'fonts.sans (Becket uses one sans family for headings and body)'],
        ['fonts.code', 'fonts.mono'],
        ['radii.default', 'radii.md'],
        ['fontSizes.root', 'fontSizes.base'],
        ['spacing.base', 'spacing.unit'],
      ]).get(path) ??
      `one of ${(keys[group] ?? groups).map((key) => (keys[group] ? `${group}.${key}` : key)).join(', ')}`
    }? Nothing was generated.`;
  }

  const required = contrast.results.filter((result) => result.level === 'required');
  const flagged = [...contrast.failures, ...contrast.advisories];
  return [
    `# Becket theme${contrast.passes ? '' : ' (contrast failures, see below)'}`,
    '## Contrast',
    [
      contrast.passes
        ? `All ${required.length} required pairs pass WCAG 2.2 AA in dark and light.`
        : `${contrast.failures.length} of ${required.length} required pairs FAIL WCAG 2.2 AA. Don't ship this theme as is.`,
      flagged.length
        ? [
            '| theme | where | ratio | needs | result |',
            '| --- | --- | --- | --- | --- |',
            ...flagged.map(
              (result) =>
                `| ${result.theme} | ${result.use} | ${result.ratio}:1 | ${result.minimum}:1 | ${result.passes ? 'pass' : result.level === 'advisory' ? 'advisory' : '**FAIL**'} |`,
            ),
          ].join('\n')
        : null,
      contrast.advisories.length
        ? `Advisory rows aren't enforced because Becket's own default theme misses them too, but fix them when you can: ${[...new Set(contrast.advisories.map((result) => result.note))].join(' ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n'),
    '## Theme CSS',
    `Write this to a file such as \`src/becket-theme.css\` and import it right after \`@becket-ui/tokens/index.css\`. It's unlayered, so it wins over Becket's defaults. Keep \`data-theme\` on <html>.\n\n\`\`\`css\n${defineBecketTheme(theme)}\`\`\``,
    '## Same theme in code',
    `\`\`\`ts\nimport { defineBecketTheme } from '@becket-ui/tokens/theme';\n\nexport const becketTheme = defineBecketTheme(${JSON.stringify(theme, null, 2)});\n\`\`\`\nInject \`becketTheme\` in a <style> tag after index.css, or keep the CSS file above. Use one, not both.`,
    notes.length
      ? `## Why each value\n${notes.map((note) => `- ${note.token}: ${note.reason}`).join('\n')}`
      : null,
    '## Next',
    contrast.passes
      ? "Show the user the brand colors and any value that was shaded for contrast, then write the CSS file. Don't hand-edit colors afterwards; call set_theme again so they stay checked."
      : `Tell the user which pairs fail and why. ${input.brand?.length ? 'Offer to unpin the failing color so Becket shades it,' : 'Offer to pass the color as `brand` instead of an exact token, so Becket shades it,'} or to pick another value, then call set_theme again. Don't write a failing theme without the user's say-so.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

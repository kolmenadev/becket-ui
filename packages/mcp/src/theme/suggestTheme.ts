import { colorDistance, deriveBecketTheme, formatHex, parseColor } from '@becket-ui/tokens/theme';

import { extractImageColors, neutralChroma, type ExtractedColor } from './extractColors';
import { loadSource, type SourceInput } from './loadSource';

export type SuggestThemeInput = SourceInput & {
  /** Colors the agent read from an image it can see but can't pass as a file (e.g. pasted in chat). */
  colors?: string[];
};

/** What a source says outright (a brand manual), as opposed to what was sampled from pixels. */
export type Stated = {
  colors: { hex: string; name?: string; page: number }[];
  fonts: { family: string; page: number }[];
  radii: { value: string; page: number }[];
  baseSize: { value: string; page: number }[];
};

export type Findings = {
  label: string;
  method: string;
  colors: ExtractedColor[];
  stated?: Stated;
  skipped: string[];
};

/** Up to three brand colors, most visual weight first, distinct from each other. */
export function pickBrand(findings: Findings): string[] {
  const read = (entry: { hex: string; share?: number }) => {
    const color = parseColor(entry.hex);
    return color ? [{ hex: entry.hex, color, share: entry.share ?? 0 }] : [];
  };
  const sampled = findings.colors.filter((color) => color.role !== 'background').flatMap(read);
  // A gradient shows up as several close shades of one hue (ΔE OK under 0.1, which most people
  // read as one color); weigh each color with its family.
  const family = (entry: (typeof sampled)[number]) =>
    sampled
      .filter((other) => colorDistance(other.color, entry.color) < 0.1)
      .reduce((sum, other) => sum + other.share, 0);
  // Stated colors (a manual) always come first, in the manual's order.
  const candidates = [
    ...(findings.stated?.colors ?? []).flatMap(read),
    // Under 5% of the artwork is a one-off graphic, not the brand.
    ...sampled.filter((entry) => family(entry) >= 0.05).toSorted((a, b) => family(b) - family(a)),
  ];
  const picked: typeof candidates = [];
  for (const candidate of candidates) {
    if (candidate.color.C < neutralChroma) continue;
    // Brand colors are different hues. Manuals print tint ramps (one hue, many lightnesses);
    // those are shades of one brand color, not three.
    const tooClose = picked.some((other) => {
      const gap = Math.abs(other.color.h - candidate.color.h);
      return Math.min(gap, 360 - gap) < 30;
    });
    if (tooClose) continue;
    picked.push(candidate);
    if (picked.length === 3) break;
  }
  if (picked.length > 0) return picked.map((entry) => entry.hex);
  // A black, gray or white logo: use its darkest neutral, and Becket stays untinted.
  const darkest = candidates
    .filter((entry) => entry.color.L < 0.9)
    .toSorted((a, b) => a.color.L - b.color.L)[0];
  return darkest ? [darkest.hex] : [];
}

export function formatSuggestion(findings: Findings): string {
  const brand = pickBrand(findings);
  const stated = findings.stated;
  const lines: string[] = [
    `# Brand suggestion from ${findings.label}`,
    `Read as: ${findings.method}.`,
  ];

  if (stated?.colors.length) {
    lines.push(
      '## Colors the source states',
      // One entry: sections are joined with blank lines, which would break a Markdown table apart.
      [
        '| color | name | page |',
        '| --- | --- | --- |',
        ...stated.colors.map((entry) => `| ${entry.hex} | ${entry.name ?? ''} | ${entry.page} |`),
      ].join('\n'),
    );
  }
  if (findings.colors.length) {
    lines.push(
      stated ? '## Colors sampled from its artwork' : '## Colors found',
      [
        '| color | share | role |',
        '| --- | --- | --- |',
        ...findings.colors
          .slice(0, 10)
          .map((color) => `| ${color.hex} | ${Math.round(color.share * 100)}% | ${color.role} |`),
      ].join('\n'),
    );
  }
  if (findings.skipped.length)
    lines.push(
      `Skipped (not a color Becket can read): ${findings.skipped.slice(0, 10).join(', ')}.`,
    );

  if (brand.length === 0) {
    lines.push(
      '## Next',
      'No brand color found. Ask the user for their brand colors (hex is best), then call set_theme with `brand`.',
    );
    return lines.join('\n\n');
  }

  const fonts = stated?.fonts ?? [];
  const steps = [
    'brand colors',
    fonts.length ? 'brand font' : null,
    stated?.radii.length || stated?.baseSize.length ? 'corners and text size' : null,
  ].filter(Boolean);
  lines.push(
    '## Guided setup',
    `Ask the user one step at a time and wait for each answer. ${steps.length} step${steps.length > 1 ? 's' : ''}: ${steps.join(', then ')}.`,
    `### Step 1 of ${steps.length}: brand colors`,
    `Ask: "These look like your brand colors: ${brand.join(', ')}. Which should Becket use, most important first?" Offer:`,
    ...[
      { label: 'Recommended', brand },
      ...(brand.length >= 2
        ? [
            { label: 'Swap the first two', brand: [brand[1], brand[0], ...brand.slice(2)] },
            { label: 'First color only', brand: [brand[0]] },
          ]
        : []),
    ].map((option, index) => {
      // Preview each option with the real derivation, so the user sees what they'd get.
      const { theme, contrast, notes } = deriveBecketTheme({ brand: option.brand });
      const toHex = (value: unknown) => {
        const color = typeof value === 'string' ? parseColor(value) : null;
        return color ? formatHex(color) : String(value);
      };
      const link = theme.colors?.link;
      const shaded = notes.some(
        (note) => note.token === 'primary' && /lightened/.test(note.reason),
      );
      const preview = `buttons ${toHex(theme.colors?.primary)}${shaded ? ` (lightened from ${option.brand[0]} for readable labels)` : ''}, light-theme links ${toHex(typeof link === 'object' ? link.light : link)}; ${contrast.passes ? 'passes AA in dark and light' : `${contrast.failures.length} AA failures`}`;
      return `${index + 1}. ${option.label}: \`${JSON.stringify(option.brand)}\` — ${preview}`;
    }),
    'Or the user gives their own hex values. Becket shades any color that would fail contrast and says why.',
  );

  let step = 1;
  if (fonts.length) {
    step += 1;
    const families = [...new Set(fonts.map((font) => font.family))];
    lines.push(
      `### Step ${step} of ${steps.length}: brand font`,
      `Ask: "Your manual uses ${families.slice(0, 3).join(', ')}. Use ${families[0]} for Becket's text?" Offer: yes (\`fonts: { "sans": "${families[0]}" }\`), another of those, or keep Becket's system font. Mention the app must load the webfont and its license must cover the web.`,
    );
  }
  if (stated?.radii.length || stated?.baseSize.length) {
    step += 1;
    const radius = stated.radii[0];
    const base = stated.baseSize[0];
    const ask = [
      radius && `corner radius ${radius.value} (page ${radius.page})`,
      base && `body text ${base.value} (page ${base.page})`,
    ]
      .filter(Boolean)
      .join(' and ');
    const values = [
      radius && `radii: { "md": "${radius.value}" }`,
      base && `fontSizes: { "base": "${base.value}" }`,
    ]
      .filter(Boolean)
      .join(', ');
    lines.push(
      `### Step ${step} of ${steps.length}: corners and text size`,
      `Ask: "Your manual sets ${ask}. Apply ${radius && base ? 'them' : 'it'} to Becket?" If yes, add ${values}. Otherwise keep Becket's defaults.`,
    );
  }
  if (!fonts.length) {
    lines.push(
      stated ? 'No font name found in the manual.' : 'An image has no font name to read.',
      'If the user mentions a brand font, add `fonts: { "sans": "<family>" }`; otherwise keep Becket\'s system font. Don\'t guess a font from a logo.',
    );
  }
  lines.push(
    '### Finish',
    `Call set_theme with only what the user confirmed, e.g. \`${JSON.stringify({ brand })}\`. It returns the CSS to write and a contrast report. Don't call set_theme before the user confirms the brand colors.`,
  );
  return lines.join('\n\n');
}

export async function suggestTheme(input: SuggestThemeInput): Promise<string> {
  try {
    if (input.colors?.length && !input.path && !input.url && !input.base64) {
      const seen = input.colors;
      const colors = seen.map((value): ExtractedColor => {
        const color = parseColor(value);
        if (!color)
          throw new Error(`Can't read the color "${value}". Use hex, rgb(), hsl() or oklch().`);
        return {
          hex: formatHex(color),
          color,
          share: 1 / seen.length,
          role: color.C < neutralChroma ? 'neutral' : 'brand',
        };
      });
      return formatSuggestion({
        label: 'the colors you read from the image',
        method: 'colors passed by the agent, in the order given',
        colors,
        skipped: [],
      });
    }
    const source = await loadSource(input);
    if (source.kind === 'pdf') {
      const { extractPDF } = await import('./extractPDF');
      return formatSuggestion(await extractPDF(source));
    }
    const { colors, method, skipped } = extractImageColors(source);
    return formatSuggestion({ label: source.label, method, colors, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Couldn't read that source: ${message}\n\nIf the image is only in the chat (pasted), read its main colors yourself and call suggest_theme with \`colors: ["#…", "#…"]\`, or ask the user for the file path.`;
  }
}

import { colorDistance, deriveBecketTheme, formatHex, parseColor } from '@becket-ui/tokens/theme';

import { extractImageColors, type ExtractedColor } from './extractColors';
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

// Brand colors closer than this read as the same color to most people.
const DISTINCT = 0.1;

/** Up to three brand colors, most visual weight first, distinct from each other. */
export function pickBrand(findings: Findings): string[] {
  const candidates = [
    ...(findings.stated?.colors ?? []),
    ...findings.colors.filter((color) => color.role !== 'background'),
  ].flatMap((entry) => {
    const color = parseColor(entry.hex);
    return color ? [{ hex: entry.hex, color }] : [];
  });
  const picked: typeof candidates = [];
  for (const candidate of candidates) {
    if (candidate.color.C < 0.04) continue;
    if (picked.some((other) => colorDistance(other.color, candidate.color) < DISTINCT)) continue;
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

/** Hex for a color deriveBecketTheme produced (always readable), for people to compare with their brand. */
const toHex = (value: unknown) => {
  const color = typeof value === 'string' ? parseColor(value) : null;
  return color ? formatHex(color) : String(value);
};

function preview(brand: string[]) {
  const { theme, contrast, notes } = deriveBecketTheme({ brand });
  const link = theme.colors?.link;
  const lightLink = typeof link === 'object' ? link.light : link;
  const shaded = notes.some((note) => note.token === 'primary' && /lightened/.test(note.reason));
  return `buttons ${toHex(theme.colors?.primary)}${shaded ? ` (lightened from ${brand[0]} for readable labels)` : ''}, light-theme links ${toHex(lightLink)}; ${contrast.passes ? 'passes AA in dark and light' : `${contrast.failures.length} AA failures`}`;
}

function options(brand: string[]) {
  const list = [{ label: 'Recommended', brand }];
  if (brand.length >= 2)
    list.push({ label: 'Swap the first two', brand: [brand[1], brand[0], ...brand.slice(2)] });
  if (brand.length >= 2) list.push({ label: 'First color only', brand: [brand[0]] });
  return list;
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

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
      '| color | name | page |',
      '| --- | --- | --- |',
      ...stated.colors.map((entry) => `| ${entry.hex} | ${entry.name ?? ''} | ${entry.page} |`),
    );
  }
  if (findings.colors.length) {
    lines.push(
      stated ? '## Colors sampled from its artwork' : '## Colors found',
      '| color | share | role |',
      '| --- | --- | --- |',
      ...findings.colors
        .slice(0, 10)
        .map((color) => `| ${color.hex} | ${percent(color.share)} | ${color.role} |`),
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
    ...options(brand).map(
      (option, index) =>
        `${index + 1}. ${option.label}: \`${JSON.stringify(option.brand)}\` — ${preview(option.brand)}`,
    ),
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
          role: color.C < 0.04 ? 'neutral' : 'brand',
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

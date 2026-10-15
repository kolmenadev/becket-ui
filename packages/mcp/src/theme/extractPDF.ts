import { formatHex, parseColor, rgbToOklch } from '@becket-ui/tokens/theme';
import { getDocumentProxy, getResolvedPDFJS } from 'unpdf';

import { mergeClose, type ExtractedColor } from './extractColors';
import type { Source } from './loadSource';
import type { Findings, Stated } from './suggestTheme';

// Brand manuals put colors, type and spacing up front; past this, pages are mostly imagery.
const MAX_PAGES = 60;
const NEUTRAL_CHROMA = 0.04;
// Fonts every PDF tool can fall back to; a manual set in one of these rarely means "use it".
const FALLBACK_FONTS =
  /^(Helvetica|Arial|Times|TimesNewRoman|Courier|Symbol|ZapfDingbats|ArialMT)$/i;
const WEIGHTS =
  /[-,]?(Thin|ExtraLight|UltraLight|Light|Regular|Book|Roman|Medium|SemiBold|DemiBold|Bold|ExtraBold|UltraBold|Black|Heavy|Italic|Oblique|It|MT|PS)+$/;

/** "ABCDEF+OpenSans-SemiBoldItalic" → "Open Sans". */
export function fontFamily(postScriptName: string): string {
  const name = postScriptName
    .replace(/^[A-Z]{6}\+/, '')
    .replace(WEIGHTS, '')
    .replace(/[-_,]+$/, '');
  return name.includes(' ') ? name : name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** px or pt → rem, so the theme keeps following the browser's text size. */
function toRem(value: number, unit: string) {
  const px = unit.toLowerCase() === 'pt' ? (value * 4) / 3 : value;
  return `${Number((px / 16).toFixed(4))}rem`;
}

const COLOR_PATTERNS: {
  pattern: RegExp;
  read: (match: RegExpMatchArray) => string | null;
  approximate?: boolean;
}[] = [
  { pattern: /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi, read: (match) => `#${match[1]}` },
  {
    pattern: /\bRGB[:\s]*\(?\s*(\d{1,3})[,\s/]+(\d{1,3})[,\s/]+(\d{1,3})\)?/gi,
    read: (match) =>
      match.slice(1, 4).every((channel) => Number(channel) <= 255)
        ? `rgb(${match[1]}, ${match[2]}, ${match[3]})`
        : null,
  },
  {
    // "CMYK 100 58 0 43", "C100 M58 Y0 K43", "C 100 / M 58 / Y 0 / K 43"
    pattern:
      /\b(?:CMYK[:\s]*\(?\s*(\d{1,3})[,\s/%]+(\d{1,3})[,\s/%]+(\d{1,3})[,\s/%]+(\d{1,3})|C\s*(\d{1,3})[,\s/%]*M\s*(\d{1,3})[,\s/%]*Y\s*(\d{1,3})[,\s/%]*K\s*(\d{1,3}))/gi,
    read: (match) => {
      const [c, m, y, k] = (match[1] ? match.slice(1, 5) : match.slice(5, 9)).map(
        (part) => Number(part) / 100,
      );
      if ([c, m, y, k].some((part) => part > 1)) return null;
      // Uncalibrated conversion: close enough to pick a hue, not a print match. Reported as approximate.
      const rgb = [c, m, y].map((part) => Math.round(255 * (1 - part) * (1 - k)));
      return formatHex(rgbToOklch(rgb[0], rgb[1], rgb[2]));
    },
    approximate: true,
  },
];

/** The words right before a color on the same line, e.g. "Ocean Blue" in "Ocean Blue #0A3D91". */
function nameBefore(line: string, index: number) {
  const words = line
    .slice(0, index)
    .replace(/(primary|secondary|accent|color|colour|hex|rgb|cmyk)\s*:?\s*$/i, '')
    .trim()
    .split(/\s+/)
    .slice(-3)
    .filter((word) => /^[A-Za-z][A-Za-z'’-]*:?$/.test(word));
  const name = words.join(' ').replace(/:$/, '');
  return name.length >= 3 ? name : undefined;
}

export function readStated(pages: string[]): Stated {
  const stated: Stated = { colors: [], fonts: [], radii: [], baseSize: [] };
  pages.forEach((text, index) => {
    const page = index + 1;
    for (const line of text.split('\n')) {
      for (const { pattern, read, approximate } of COLOR_PATTERNS) {
        for (const match of line.matchAll(pattern)) {
          const value = read(match);
          const color = value && parseColor(value);
          if (!color) continue;
          const hex = formatHex(color);
          if (stated.colors.some((entry) => entry.hex === hex)) continue;
          const name = nameBefore(line, match.index ?? 0);
          stated.colors.push({
            hex,
            name: approximate ? `${name ?? ''} (from CMYK, approximate)`.trim() : name,
            page,
          });
        }
      }
      for (const match of line.matchAll(
        /\b(?:corner|border)[\s-]*radi(?:us|i)\b[^0-9\n]{0,24}(\d+(?:\.\d+)?)\s*(px|pt)\b/gi,
      )) {
        stated.radii.push({ value: toRem(Number(match[1]), match[2]), page });
      }
      for (const match of line.matchAll(
        /\b(?:body|base|paragraph)\s*(?:text|copy|font)?\s*(?:size)?\b[^0-9\n]{0,24}(\d+(?:\.\d+)?)\s*(px|pt)\b/gi,
      )) {
        const size = Number(match[1]);
        if (size >= 10 && size <= 24) stated.baseSize.push({ value: toRem(size, match[2]), page });
      }
    }
  });
  return stated;
}

/** Colors, fonts, corner radius and text size from a brand manual PDF. Nothing in the PDF runs. */
export async function extractPDF(source: Source): Promise<Findings> {
  const { OPS } = await getResolvedPDFJS();
  const pdf = await getDocumentProxy(new Uint8Array(source.bytes));
  const pageCount = Math.min(pdf.numPages, MAX_PAGES);
  const pages: string[] = [];
  const fills = new Map<string, number>();
  const fontUse = new Map<string, { family: string; characters: number; page: number }>();

  for (let number = 1; number <= pageCount; number += 1) {
    const page = await pdf.getPage(number);
    const content = await page.getTextContent();
    let text = '';
    let lastY: number | null = null;
    const charactersByFont = new Map<string, number>();
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 1) text += '\n';
      text += item.str;
      if (item.hasEOL) text += '\n';
      lastY = y;
      charactersByFont.set(
        item.fontName,
        (charactersByFont.get(item.fontName) ?? 0) + item.str.trim().length,
      );
    }
    pages.push(text);

    const operators = await page.getOperatorList();
    operators.fnArray.forEach((fn, index) => {
      if (fn !== OPS.setFillRGBColor) return;
      const [hex] = operators.argsArray[index] as [string];
      if (typeof hex === 'string') fills.set(hex, (fills.get(hex) ?? 0) + 1);
    });
    for (const [id, characters] of charactersByFont) {
      if (!characters || !page.commonObjs.has(id)) continue;
      const font = page.commonObjs.get(id) as { name?: string } | undefined;
      if (!font?.name) continue;
      const family = fontFamily(font.name);
      const entry = fontUse.get(family) ?? { family, characters: 0, page: number };
      entry.characters += characters;
      fontUse.set(family, entry);
    }
    page.cleanup();
  }
  const totalPages = pdf.numPages;
  await pdf.loadingTask.destroy();

  const stated = readStated(pages);
  stated.fonts = [...fontUse.values()]
    .filter((font) => !FALLBACK_FONTS.test(font.family.replace(/\s/g, '')))
    .toSorted((a, b) => b.characters - a.characters)
    .map(({ family, page }) => ({ family, page }));

  const total = [...fills.values()].reduce((sum, count) => sum + count, 0);
  const colors: ExtractedColor[] = [...fills.entries()].flatMap(([hex, count]) => {
    const color = parseColor(hex);
    if (!color) return [];
    return [
      {
        hex: formatHex(color),
        color,
        share: count / total,
        role: color.C < NEUTRAL_CHROMA ? 'neutral' : 'brand',
      } as ExtractedColor,
    ];
  });

  return {
    label: source.label,
    method: `PDF, ${pageCount} of ${totalPages} pages: stated colors, fonts and sizes from the text, plus artwork fill colors (by how often each is used, not by area)`,
    colors: mergeClose(colors),
    stated,
    skipped:
      totalPages > MAX_PAGES
        ? [`pages ${MAX_PAGES + 1}–${totalPages} (only the first ${MAX_PAGES} are read)`]
        : [],
  };
}

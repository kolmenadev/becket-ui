import { formatHex, parseColor, rgbToOklch } from '@becket-ui/tokens/theme';
import { getDocumentProxy, getResolvedPDFJS } from 'unpdf';

import { mergeClose, neutralChroma, type ExtractedColor } from './extractColors';
import type { Source } from './loadSource';
import type { Findings, Stated } from './suggestTheme';

// Brand manuals put colors, type and spacing up front; past this, pages are mostly imagery.
const maxPages = 60;

/** Colors, fonts, corner radius and text size from a brand manual PDF. Nothing in the PDF runs. */
export async function extractPDF(source: Source): Promise<Findings> {
  const { OPS } = await getResolvedPDFJS();
  const pdf = await getDocumentProxy(new Uint8Array(source.bytes));
  const totalPages = pdf.numPages;
  const pageCount = Math.min(totalPages, maxPages);
  const pages: string[] = [];
  const fills = new Map<string, number>();
  const fontUse = new Map<string, { family: string; characters: number; page: number }>();

  for (let number = 1; number <= pageCount; number += 1) {
    const page = await pdf.getPage(number);
    let text = '';
    let lastY: number | null = null;
    const charactersByFont = new Map<string, number>();
    for (const item of (await page.getTextContent()).items) {
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
      // pdf.js passes the fill as one "#rrggbb" string; argsArray is typed `any[]`.
      const [hex] = operators.argsArray[index] as [string];
      if (typeof hex === 'string') fills.set(hex, (fills.get(hex) ?? 0) + 1);
    });
    for (const [id, characters] of charactersByFont) {
      if (!characters || !page.commonObjs.has(id)) continue;
      // commonObjs.get returns `any`; a loaded font carries its PostScript name.
      const font = page.commonObjs.get(id) as { name?: string } | undefined;
      if (!font?.name) continue;
      // "ABCDEF+OpenSans-SemiBoldItalic" → "Open Sans": drop the subset tag and the weight/style.
      const name = font.name
        .replace(/^[A-Z]{6}\+/, '')
        .replace(
          /[-,]?(Thin|ExtraLight|UltraLight|Light|Regular|Book|Roman|Medium|SemiBold|DemiBold|Bold|ExtraBold|UltraBold|Black|Heavy|Italic|Oblique|It|MT|PS)+$/,
          '',
        )
        .replace(/[-_,]+$/, '');
      const family = name.includes(' ') ? name : name.replace(/([a-z])([A-Z])/g, '$1 $2');
      const entry = fontUse.get(family) ?? { family, characters: 0, page: number };
      entry.characters += characters;
      fontUse.set(family, entry);
    }
    page.cleanup();
  }
  await pdf.loadingTask.destroy();

  // What the manual says outright, line by line.
  const stated: Stated = { colors: [], fonts: [], radii: [], baseSize: [] };
  pages.forEach((text, index) => {
    const page = index + 1;
    for (const line of text.split('\n')) {
      for (const { pattern, read, approximate } of [
        {
          pattern: /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi,
          read: (match: RegExpMatchArray) => `#${match[1]}`,
        },
        {
          pattern: /\bRGB[:\s]*\(?\s*(\d{1,3})[,\s/]+(\d{1,3})[,\s/]+(\d{1,3})\)?/gi,
          read: (match: RegExpMatchArray) =>
            match.slice(1, 4).every((channel) => Number(channel) <= 255)
              ? `rgb(${match[1]}, ${match[2]}, ${match[3]})`
              : null,
        },
        {
          // "CMYK 100 58 0 43", "C100 M58 Y0 K43", "C 100 / M 58 / Y 0 / K 43"
          pattern:
            /\b(?:CMYK[:\s]*\(?\s*(\d{1,3})[,\s/%]+(\d{1,3})[,\s/%]+(\d{1,3})[,\s/%]+(\d{1,3})|C\s*(\d{1,3})[,\s/%]*M\s*(\d{1,3})[,\s/%]*Y\s*(\d{1,3})[,\s/%]*K\s*(\d{1,3}))/gi,
          read: (match: RegExpMatchArray) => {
            const [c, m, y, k] = (match[1] ? match.slice(1, 5) : match.slice(5, 9)).map(
              (part) => Number(part) / 100,
            );
            if ([c, m, y, k].some((part) => part > 1)) return null;
            // Uncalibrated conversion: close enough to pick a hue, not a print match. Reported as approximate.
            const [r, g, b] = [c, m, y].map((part) => Math.round(255 * (1 - part) * (1 - k)));
            return formatHex(rgbToOklch([r, g, b]));
          },
          approximate: true,
        },
      ]) {
        for (const match of line.matchAll(pattern)) {
          const value = read(match);
          const color = value && parseColor(value);
          if (!color) continue;
          const hex = formatHex(color);
          if (stated.colors.some((entry) => entry.hex === hex)) continue;
          // The words right before the color, e.g. "Ocean Blue" in "Ocean Blue #0A3D91".
          const name = line
            .slice(0, match.index ?? 0)
            .replace(/(primary|secondary|accent|color|colour|hex|rgb|cmyk)\s*:?\s*$/i, '')
            .trim()
            .split(/\s+/)
            .slice(-3)
            .filter((word) => /^[A-Za-z][A-Za-z'’-]*:?$/.test(word))
            .join(' ')
            .replace(/:$/, '');
          const label = name.length >= 3 ? name : undefined;
          stated.colors.push({
            hex,
            name: approximate ? `${label ?? ''} (from CMYK, approximate)`.trim() : label,
            page,
          });
        }
      }
      for (const match of line.matchAll(
        /\b(?:corner|border)[\s-]*radi(?:us|i)\b[^0-9\n]{0,24}(\d+(?:\.\d+)?)\s*(px|pt)\b/gi,
      )) {
        stated.radii.push({
          // px or pt → rem, so the theme keeps following the browser's text size.
          value: `${Number(((match[2].toLowerCase() === 'pt' ? (Number(match[1]) * 4) / 3 : Number(match[1])) / 16).toFixed(4))}rem`,
          page,
        });
      }
      for (const match of line.matchAll(
        /\b(?:body|base|paragraph)\s*(?:text|copy|font)?\s*(?:size)?\b[^0-9\n]{0,24}(\d+(?:\.\d+)?)\s*(px|pt)\b/gi,
      )) {
        const size = Number(match[1]);
        if (size < 10 || size > 24) continue;
        stated.baseSize.push({
          value: `${Number(((match[2].toLowerCase() === 'pt' ? (size * 4) / 3 : size) / 16).toFixed(4))}rem`,
          page,
        });
      }
    }
  });
  stated.fonts = [...fontUse.values()]
    // Fonts every PDF tool falls back to; a manual set in one of these rarely means "use it".
    .filter(
      (font) =>
        !/^(Helvetica|Arial|Times|TimesNewRoman|Courier|Symbol|ZapfDingbats|ArialMT)$/i.test(
          font.family.replace(/\s/g, ''),
        ),
    )
    // pdf.js names glyph-drawn (Type 3) and unnamed fonts with placeholders, not real families.
    .filter(
      (font) => /[a-z]{2}/i.test(font.family) && !/^(Type\s?3|T3\s?Font|g_d\d)/i.test(font.family),
    )
    .toSorted((a, b) => b.characters - a.characters)
    .map(({ family, page }) => ({ family, page }));

  // Summed once here, not per color inside the flatMap below.
  const total = [...fills.values()].reduce((sum, count) => sum + count, 0);
  return {
    label: source.label,
    method: `PDF, ${pageCount} of ${totalPages} pages: stated colors, fonts and sizes from the text, plus artwork fill colors (by how often each is used, not by area)`,
    colors: mergeClose(
      [...fills.entries()].flatMap(([hex, count]): ExtractedColor[] => {
        const color = parseColor(hex);
        if (!color) return [];
        return [
          {
            hex: formatHex(color),
            color,
            share: count / total,
            role: color.C < neutralChroma ? 'neutral' : 'brand',
          },
        ];
      }),
    ),
    stated,
    skipped:
      totalPages > maxPages
        ? [`pages ${maxPages + 1}–${totalPages} (only the first ${maxPages} are read)`]
        : [],
  };
}

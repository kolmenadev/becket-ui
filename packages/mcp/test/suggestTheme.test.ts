import { colorDistance, parseColor } from '@becket-ui/tokens/theme';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { extractImageColors } from '../src/theme/extractColors';
import { extractPDF, fontFamily } from '../src/theme/extractPDF';
import { detectKind, type Source } from '../src/theme/loadSource';
import { pickBrand, suggestTheme } from '../src/theme/suggestTheme';
import {
  bigLogo,
  brandManualPDF,
  flatSVG,
  gradientSVG,
  monoLogo,
  multicolorLogo,
  photoLogo,
  stripes,
  transparentLogo,
} from './brandFixtures';

const source = (bytes: Buffer, label = 'fixture'): Source => ({
  bytes,
  kind: detectKind(bytes),
  label,
});
const close = (actual: string, expected: string) =>
  colorDistance(parseColor(actual)!, parseColor(expected)!) < 0.02;
const brandOf = (bytes: Buffer) => {
  const { colors, method, skipped } = extractImageColors(source(bytes));
  return pickBrand({ label: 'fixture', method, colors, skipped });
};

describe('extracting brand colors from logos', () => {
  it('PNG with transparency: ignores transparent and anti-aliased pixels', () => {
    const brand = brandOf(transparentLogo());
    expect(brand).toHaveLength(2);
    expect(close(brand[0], '#0a3d91')).toBe(true);
    expect(close(brand[1], '#f5a623')).toBe(true);
  });

  it('JPEG over a photo: the mark wins and the background is set aside', () => {
    const { colors } = extractImageColors(source(photoLogo()));
    const brand = pickBrand({ label: 'fixture', method: '', colors, skipped: [] });
    expect(close(brand[0], '#d0021b')).toBe(true);
    expect(colors.filter((color) => color.role === 'background').length).toBeGreaterThan(0);
    expect(colors.find((color) => close(color.hex, '#d0021b'))?.role).toBe('brand');
  });

  it('one-color logo: black on white gives a single neutral brand color', () => {
    const { colors } = extractImageColors(source(monoLogo()));
    expect(colors.find((color) => color.hex === '#ffffff')?.role).toBe('background');
    expect(brandOf(monoLogo())).toEqual(['#111111']);
  });

  it('multicolor logo: the three biggest stripes, biggest first', () => {
    const brand = brandOf(multicolorLogo());
    expect(brand).toHaveLength(3);
    stripes
      .slice(0, 3)
      .forEach((expected, index) => expect(close(brand[index], expected)).toBe(true));
  });

  it('flat SVG: reads declared colors only, never runs or loads anything', () => {
    const { colors, skipped } = extractImageColors(source(Buffer.from(flatSVG)));
    const brand = pickBrand({ label: 'fixture', method: '', colors, skipped });
    expect(brand.map((hex) => hex.toLowerCase())).toEqual(['#0a3d91', '#f5a623']);
    expect(skipped).toEqual(['rebeccapurple']);
  });

  it('SVG gradient: both stop colors and the CSS class color', () => {
    const { colors } = extractImageColors(source(Buffer.from(gradientSVG)));
    const hexes = colors.map((color) => color.hex);
    expect(hexes).toEqual(expect.arrayContaining(['#ff6b6b', '#4ecdc4', '#1a1a2e']));
  });

  it('a 2000×2000 PNG takes under a second', () => {
    const bytes = bigLogo();
    const start = performance.now();
    const brand = brandOf(bytes);
    expect(performance.now() - start).toBeLessThan(1000);
    expect(close(brand[0], '#0a3d91')).toBe(true);
  });

  it('refuses formats it cannot decode with a way forward', () => {
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);
    expect(() => extractImageColors(source(webp))).toThrow(
      /WEBP isn't supported yet. Export the logo as SVG or PNG/,
    );
    expect(() => extractImageColors(source(Buffer.from('hello')))).toThrow(
      /isn't a PNG, JPEG, SVG or PDF/,
    );
  });
});

describe('reading a brand manual PDF', () => {
  it('finds stated colors, the brand font, radius and text size, plus artwork colors', async () => {
    const findings = await extractPDF(source(brandManualPDF(), 'manual.pdf'));
    expect(findings.stated?.colors[0]).toEqual({ hex: '#0a3d91', name: 'Ocean Blue', page: 1 });
    expect(findings.stated?.colors[1].name).toBe('Sunrise (from CMYK, approximate)');
    expect(findings.stated?.fonts).toEqual([{ family: 'Montserrat', page: 1 }]);
    expect(findings.stated?.radii).toEqual([{ value: '0.25rem', page: 1 }]);
    expect(findings.stated?.baseSize).toEqual([{ value: '1rem', page: 1 }]);
    expect(findings.colors.map((color) => color.hex)).toEqual(
      expect.arrayContaining(['#0a3d91', '#f5a624']),
    );
    // Stated colors come before sampled ones.
    expect(pickBrand(findings)[0]).toBe('#0a3d91');
  });

  it('names fonts the way CSS does', () => {
    expect(fontFamily('ABCDEF+OpenSans-SemiBoldItalic')).toBe('Open Sans');
    expect(fontFamily('Montserrat-Bold')).toBe('Montserrat');
    expect(fontFamily('ArialMT')).toBe('Arial');
  });
});

describe('suggest_theme', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'becket-suggest-'));

  it('walks the user through brand colors one step at a time, then set_theme', async () => {
    const path = join(tmp, 'logo.png');
    writeFileSync(path, transparentLogo());
    const text = await suggestTheme({ path });
    expect(text).toContain('# Brand suggestion from logo.png');
    expect(text).toContain(
      'Ask the user one step at a time and wait for each answer. 1 step: brand colors.',
    );
    expect(text).toMatch(
      /1\. Recommended: `\["#[0-9a-f]{6}","#[0-9a-f]{6}"\]` — buttons #[0-9a-f]{6}.*passes AA in dark and light/,
    );
    expect(text).toContain('2. Swap the first two');
    expect(text).toContain("Don't guess a font from a logo.");
    expect(text).toMatch(/Call set_theme with only what the user confirmed, e\.g\. `\{"brand":\[/);
  });

  it('adds font and size steps when a manual states them', async () => {
    const text = await suggestTheme({ base64: brandManualPDF().toString('base64') });
    expect(text).toContain('3 steps: brand colors, then brand font, then corners and text size.');
    expect(text).toContain('Your manual uses Montserrat');
    expect(text).toContain('`fonts: { "sans": "Montserrat" }`');
    expect(text).toContain('radii: { "md": "0.25rem" }, fontSizes: { "base": "1rem" }');
    expect(text).toContain('| #0a3d91 | Ocean Blue | 1 |');
  });

  it('accepts colors the agent read from a pasted image', async () => {
    const text = await suggestTheme({ colors: ['#0a3d91', 'rgb(245, 166, 35)'] });
    expect(text).toContain('the colors you read from the image');
    expect(text).toContain('`["#0a3d91","#f5a623"]`');
  });

  it('accepts data: URLs and explains failures with a way forward', async () => {
    expect(
      await suggestTheme({
        base64: `data:image/svg+xml;base64,${Buffer.from(flatSVG).toString('base64')}`,
      }),
    ).toContain('#0a3d91');
    const missing = await suggestTheme({ path: join(tmp, 'nope.png') });
    expect(missing).toContain("Couldn't read that source: No file at");
    expect(missing).toContain('call suggest_theme with `colors:');
    expect(await suggestTheme({ path: 'a.png', url: 'https://example.com/a.png' })).toContain(
      'Pass exactly one of path, url or base64.',
    );
  });
});

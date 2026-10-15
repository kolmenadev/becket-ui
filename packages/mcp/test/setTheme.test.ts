import { describe, expect, it } from 'vitest';

import { setTheme } from '../src/theme/setTheme';

describe('set_theme', () => {
  it('builds a full AA theme from one brand color and explains the shaded values', () => {
    const text = setTheme({ brand: ['#0a3d91'] });
    expect(text).toContain('All 34 required pairs pass WCAG 2.2 AA in dark and light.');
    expect(text).toMatch(/```css\n:root \{\n[\s\S]*--beckui--colors-primary: oklch\(/);
    expect(text).toContain("html[data-theme='light']");
    expect(text).toContain("import { defineBecketTheme } from '@becket-ui/tokens/theme';");
    expect(text).toMatch(/- primary: Brand color 1 lightened from L 0\.39/);
    expect(text).toMatch(/- link: Brand color 1 used as is in light/);
  });

  it('keeps exact tokens and reports the pairs they fail, without calling it shippable', () => {
    const text = setTheme({ colors: { primary: '#0a3d91' } });
    expect(text).toContain('--beckui--colors-primary: #0a3d91;');
    expect(text).toMatch(/\d+ of 34 required pairs FAIL/);
    expect(text).toMatch(/\| dark \| label on a filled primary control \| 1\.\d+:1 \| 4\.5:1 \| \*\*FAIL\*\* \|/);
    expect(text).toContain('pass the color as `brand`');
  });

  it('pins exact colors next to brand colors', () => {
    const text = setTheme({ brand: ['#0a3d91'], colors: { background: { dark: 'oklch(0.18 0.03 260)', light: '#ffffff' } } });
    expect(text).toContain('--beckui--colors-background: oklch(0.18 0.03 260);');
    expect(text).toContain('--beckui--colors-background: #ffffff;');
    expect(text).toContain('- background: Pinned by you, kept exactly.');
    expect(text).toContain('required pairs pass');
  });

  it('writes px lengths as rem (and the text unit as em)', () => {
    const text = setTheme({ spacing: { unit: '4px', textUnit: '4px' }, fontSizes: { base: '15px' }, radii: { md: '4px' } });
    expect(text).toContain('--beckui--spacing-unit: 0.25rem;');
    expect(text).toContain('--beckui--spacing-text-unit: 0.25em;');
    expect(text).toContain('--beckui--font-sizes-base: 0.9375rem;');
    expect(text).toContain('--beckui--radii-md: 0.25rem;');
    expect(text).toContain('4px written as 0.25rem');
  });

  it('adds system fallbacks to a brand font and says the app loads it', () => {
    const text = setTheme({ fonts: { sans: 'Neue Haas Grotesk', mono: 'JetBrains Mono, monospace' } });
    expect(text).toContain("--beckui--fonts-sans: 'Neue Haas Grotesk', system-ui");
    expect(text).toContain("--beckui--fonts-mono: 'JetBrains Mono', monospace;");
    expect(text).toContain('Load the webfont in your app');
  });

  it('names the right key for common near-misses and generates nothing', () => {
    expect(setTheme({ colors: { brand: '#fff' } })).toBe(
      'Unknown Becket theme key "colors.brand". Did you mean brand (a top-level list of one to three colors)? Nothing was generated.',
    );
    expect(setTheme({ colors: { bg: '#fff' } })).toContain('Did you mean colors.background?');
    expect(setTheme({ fonts: { display: 'Inter' } })).toContain('Did you mean one of fonts.sans, fonts.mono?');
  });

  it('says what to pass when a color or the input is unreadable', () => {
    expect(setTheme({ brand: ['corporate blue'] })).toContain('Can\'t read the brand color "corporate blue"');
    expect(setTheme({ colors: { primary: 'corporate blue' } })).toContain('Use hex, rgb(), hsl() or oklch().');
    expect(setTheme({})).toContain('Nothing to set.');
  });
});

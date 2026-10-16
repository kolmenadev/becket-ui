/**
 * Resolve a BecketTheme to final colors in both themes, the way the browser would, and check
 * every pair Becket draws text or controls with.
 */

import { contrastRatio, formatOklch, parseColor } from './color.mjs';

/**
 * Default color tokens as index.css declares them. `{key}` is a reference to another token, so
 * a theme that changes `primary` also moves `link`. contrast.test.mjs asserts these match
 * index.css, so they can't drift.
 */
export const defaultColors = {
  dark: {
    primary: 'oklch(0.75 0.15 78)',
    secondary: 'oklch(0.70 0.13 125)',
    tertiary: 'oklch(0.60 0.16 48)',
    // index.css: color-mix(in oklch, primary 88%, white)
    primaryHover: { mixWithWhite: 'primary', amount: 0.88 },
    'neutral.50': 'oklch(0.96 0.012 78)',
    'neutral.100': 'oklch(0.94 0.012 78)',
    'neutral.200': 'oklch(0.89 0.012 75)',
    'neutral.300': 'oklch(0.84 0.012 72)',
    'neutral.400': 'oklch(0.75 0.012 70)',
    'neutral.500': 'oklch(0.65 0.012 65)',
    'neutral.600': 'oklch(0.55 0.014 62)',
    'neutral.700': 'oklch(0.45 0.014 60)',
    'neutral.800': 'oklch(0.35 0.015 60)',
    'neutral.900': 'oklch(0.22 0.015 60)',
    white: 'oklch(99% 0 0)',
    background: '{neutral.900}',
    text: '{neutral.50}',
    muted: '{neutral.300}',
    surface: '{neutral.800}',
    border: '{neutral.200}',
    danger: 'oklch(0.76 0.16 25)',
    accent: 'oklch(0.86 0.12 125)',
    link: '{primary}',
    linkHover: 'oklch(0.78 0.13 78)',
    linkVisited: 'oklch(0.72 0.12 125)',
    warning: 'oklch(0.72 0.16 42)',
    success: 'oklch(0.68 0.14 165)',
  },
  /** Only what `[data-theme='light']` changes; the rest is inherited from dark. */
  light: {
    background: '{neutral.50}',
    text: '{neutral.900}',
    muted: 'oklch(0.53 0.014 62)',
    surface: '{white}',
    danger: 'oklch(0.48 0.20 25)',
    accent: 'oklch(0.38 0.14 125)',
    link: 'oklch(0.54 0.12 70)',
    linkHover: 'oklch(0.46 0.11 70)',
    linkVisited: 'oklch(0.52 0.09 125)',
  },
};

const text = 4.5;
const canvases = ['background', 'surface'];

/**
 * Every pair Becket draws. `required` pairs pass in the default theme and must pass in any
 * theme. `advisory` pairs fail in the default theme too (see their `note`), so they're
 * reported, not enforced, until Becket's recipes change.
 */
export const contrastPairs = [
  ...['text', 'muted', 'link', 'linkHover', 'linkVisited', 'danger', 'accent'].flatMap(
    (foreground) =>
      canvases.map((background) => ({
        foreground,
        background,
        minimum: text,
        level: 'required',
        use: `${foreground} text on ${background}`,
      })),
  ),
  ...['primary', 'primaryHover', 'secondary'].map((background) => ({
    foreground: 'neutral.900',
    background,
    minimum: text,
    level: 'required',
    use: `label on a filled ${background} control`,
  })),
  {
    foreground: 'neutral.900',
    background: 'tertiary',
    minimum: text,
    level: 'advisory',
    use: 'label over the tertiary end of a gradient fill',
    note: 'The default tertiary is 4.13:1; the label mostly sits over the primary half.',
  },
  ...canvases.map((background) => ({
    foreground: 'primary',
    background,
    // Non-text UI and state indicators (WCAG 1.4.11).
    minimum: 3,
    level: 'advisory',
    use: `focus ring and checked controls on ${background}`,
    note: 'A primary light enough for dark labels is usually too light for 3:1 on a near-white canvas; the default is 2.02:1 in light.',
  })),
];

/**
 * Final colors in both themes for a theme config, as OKLCH.
 *
 * Mirrors the CSS that `defineBecketTheme` emits: its `:root` block is unlayered, so it beats
 * index.css's layered light block too. A plain string (or a `{ dark }` value) therefore applies
 * in light as well, unless the config also gives `light`.
 *
 * @param {import('./index.d.ts').BecketTheme} [theme]
 */
export function resolveBecketColors(theme = {}) {
  const root = {};
  const lightOnly = {};
  for (const [key, value] of Object.entries(theme.colors ?? {})) {
    if (value == null) continue;
    if (key === 'neutral') {
      for (const [step, color] of Object.entries(value)) root[`neutral.${step}`] = color;
    } else if (typeof value === 'object') {
      if (value.dark) root[key] = value.dark;
      if (value.light) lightOnly[key] = value.light;
    } else {
      root[key] = value;
    }
  }
  const [dark, light] = [
    { ...defaultColors.dark, ...root },
    { ...defaultColors.dark, ...defaultColors.light, ...root, ...lightOnly },
  ].map((table) => {
    const resolved = {};
    const resolve = (key, depth = 0) => {
      if (resolved[key]) return resolved[key];
      if (depth > 8) throw new Error(`Color token "${key}" refers to itself`);
      const value = table[key];
      if (value == null) throw new Error(`Unknown color token "${key}"`);
      let color;
      if (typeof value === 'object') {
        const base = resolve(value.mixWithWhite, depth + 1);
        // color-mix(in oklch, base n%, white): white has no hue, so the hue stays the base's.
        color = {
          L: base.L * value.amount + (1 - value.amount),
          C: base.C * value.amount,
          h: base.h,
        };
      } else {
        const reference = value.match(/^\{([\w.]+)\}$/);
        color = reference ? resolve(reference[1], depth + 1) : parseColor(value);
        if (!color)
          throw new Error(`Can't read colors.${key} "${value}". Use hex, rgb(), hsl() or oklch().`);
      }
      resolved[key] = color;
      return color;
    };
    for (const key of Object.keys(table)) resolve(key);
    return resolved;
  });
  return { dark, light };
}

/**
 * WCAG 2.2 AA contrast for every pair in contrastPairs, in dark and light.
 *
 * @param {import('./index.d.ts').BecketTheme} [theme]
 * @returns {import('./index.d.ts').BecketContrastReport}
 */
export function checkBecketThemeContrast(theme = {}) {
  const colors = resolveBecketColors(theme);
  const results = ['dark', 'light'].flatMap((mode) =>
    contrastPairs.map((pair) => {
      const ratio = contrastRatio(colors[mode][pair.foreground], colors[mode][pair.background]);
      return {
        ...pair,
        theme: mode,
        ratio: Math.floor(ratio * 100) / 100,
        passes: ratio >= pair.minimum,
        foregroundColor: formatOklch(colors[mode][pair.foreground]),
        backgroundColor: formatOklch(colors[mode][pair.background]),
      };
    }),
  );
  return {
    passes: results.every((result) => result.passes || result.level === 'advisory'),
    failures: results.filter((result) => !result.passes && result.level === 'required'),
    advisories: results.filter((result) => !result.passes && result.level === 'advisory'),
    results,
  };
}

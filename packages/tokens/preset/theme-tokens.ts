/**
 * Becket token trees plus `{path.to.token}` helpers.
 * Cmd-click a helper key (`colorRef('primary')`) to jump to that token.
 */

export const brandColors = {
  becketYellow: { value: 'oklch(0.75 0.15 78)' },
  hiveSage: { value: 'oklch(0.70 0.13 125)' },
  combAmber: { value: 'oklch(0.60 0.16 48)' },
} as const;

function brandColor<K extends keyof typeof brandColors>(key: K) {
  return `{colors.brand.${key}}` as `{colors.brand.${K}}`;
}

export const neutralColors = {
  50: { value: 'oklch(0.96 0.012 78)' },
  100: { value: 'oklch(0.94 0.012 78)' },
  200: { value: 'oklch(0.89 0.012 75)' },
  300: { value: 'oklch(0.84 0.012 72)' },
  400: { value: 'oklch(0.75 0.012 70)' },
  500: { value: 'oklch(0.65 0.012 65)' },
  600: { value: 'oklch(0.55 0.014 62)' },
  700: { value: 'oklch(0.45 0.014 60)' },
  800: { value: 'oklch(0.35 0.015 60)' },
  900: { value: 'oklch(0.22 0.015 60)' },
} as const;

function neutralColor<K extends keyof typeof neutralColors>(key: K) {
  return `{colors.neutral.${key}}` as `{colors.neutral.${K}}`;
}

const colorAliases = {
  primary: { value: brandColor('becketYellow') },
  secondary: { value: brandColor('hiveSage') },
  tertiary: { value: brandColor('combAmber') },
} as const;

function colorAlias<K extends keyof typeof colorAliases>(key: K) {
  return `{colors.${key}}` as `{colors.${K}}`;
}

export const colors = {
  brand: brandColors,
  ...colorAliases,
  primaryHover: {
    value: `color-mix(in oklch, ${colorAlias('primary')} 88%, white)`,
  },
  neutral: neutralColors,
  black: { value: 'oklch(20% 0 0)' },
  white: { value: 'oklch(99% 0 0)' },
  border: { value: neutralColor(200) },
  danger: { value: 'oklch(0.62 0.20 25)' },
  warning: { value: 'oklch(0.78 0.14 95)' },
  success: { value: 'oklch(0.68 0.16 145)' },
  /** @deprecated Prefer semantic `text` / `background`. Kept as CSS-var aliases. */
  lightBackground: { value: neutralColor(50) },
  lightText: { value: neutralColor(900) },
};

type ColorGroup = 'brand' | 'neutral';
type ColorLeaf = Exclude<keyof typeof colors, ColorGroup>;

function colorLeafRef<K extends ColorLeaf>(key: K) {
  return `{colors.${key}}` as `{colors.${K}}`;
}

export const semanticColors = {
  background: {
    value: {
      base: neutralColor(900),
      _light: neutralColor(50),
    },
  },
  text: {
    value: {
      base: neutralColor(50),
      _light: neutralColor(900),
    },
  },
  muted: {
    value: {
      base: neutralColor(300),
      _light: neutralColor(600),
    },
  },
  /** Overlay / control fill (dialog, field, menu). Cards keep their own surfaces. */
  surface: {
    value: {
      base: neutralColor(800),
      _light: colorLeafRef('white'),
    },
  },
};

type SemanticColorKey = keyof typeof semanticColors;

/** Panda `{colors.*}` ref. Cmd-click the key to jump to the token. */
export function colorRef<K extends ColorLeaf | SemanticColorKey>(
  key: K,
): `{colors.${K}}`;
export function colorRef<K extends keyof typeof brandColors>(
  group: 'brand',
  key: K,
): `{colors.brand.${K}}`;
export function colorRef<K extends keyof typeof neutralColors>(
  group: 'neutral',
  key: K,
): `{colors.neutral.${K}}`;
export function colorRef(
  groupOrKey: string,
  nestedKey?: string | number,
): `{colors.${string}}` {
  if (nestedKey !== undefined) {
    return `{colors.${groupOrKey}.${nestedKey}}`;
  }
  return `{colors.${groupOrKey}}`;
}

const spacingScale = {
  0: { value: '0rem' },
  1: { value: '0.25rem' },
  2: { value: '0.5rem' },
  3: { value: '0.75rem' },
  5: { value: '1.25rem' },
  8: { value: '2rem' },
  13: { value: '3.25rem' },
  21: { value: '5.25rem' },
  34: { value: '8.5rem' },
} as const;

/** Panda `{spacing.*}` ref. Cmd-click the key to jump to the token. */
export function spacingRef<K extends keyof typeof spacingScale>(key: K) {
  return `{spacing.${key}}` as `{spacing.${K}}`;
}

export const spacing = {
  ...spacingScale,
  xs: { value: spacingRef(1) },
  sm: { value: spacingRef(2) },
  md: { value: spacingRef(3) },
  lg: { value: spacingRef(5) },
  xl: { value: spacingRef(8) },
  '2xs': { value: spacingRef(13) },
};

export const sizes = {
  0: { value: '0rem' },
  1: { value: '0.25rem' },
  2: { value: '0.5rem' },
  3: { value: '0.75rem' },
  5: { value: '1.25rem' },
  8: { value: '2rem' },
  13: { value: '3.25rem' },
  21: { value: '5.25rem' },
  34: { value: '8.5rem' },
  55: { value: '13.75rem' },
  /** Default form-control width (~200px at 16px root). */
  field: { value: '12.5rem' },
};

export const radii = {
  none: { value: '0px' },
  sm: { value: '4px' },
  md: { value: '8px' },
  lg: { value: '12px' },
  xl: { value: '20px' },
  full: { value: '9999px' },
};

export const fonts = {
  sans: { value: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif" },
  mono: { value: "'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'" },
};

export const fontSizes = {
  xs: { value: '0.75rem' },
  sm: { value: '0.875rem' },
  md: { value: '1rem' },
  lg: { value: '1.25rem' },
  xl: { value: '1.5rem' },
  '2xl': { value: '2rem' },
  '3xl': { value: '3rem' },
  '4xl': { value: '3.75rem' },
  '5xl': { value: '4.5rem' },
  '6xl': { value: '6rem' },
};

export const fontWeights = {
  normal: { value: '400' },
  medium: { value: '500' },
  bold: { value: '700' },
};

export const lineHeights = {
  normal: { value: '1.5' },
  tight: { value: '1.25' },
  loose: { value: '1.75' },
};

export const shadows = {
  sm: { value: '0 1px 3px 0 oklch(0% 0 0 / 0.08)' },
  md: { value: '0 3px 6px 0 oklch(0% 0 0 / 0.12)' },
  lg: { value: '0 8px 16px 0 oklch(0% 0 0 / 0.16)' },
  /** Readable on dark surfaces (black sm/md/lg wash out). */
  elevated: {
    value: '0 12px 32px oklch(0% 0 0 / 0.55), 0 0 0 1px oklch(100% 0 0 / 0.08)',
  },
  outline: {
    value: `0 0 0 2px color-mix(in srgb, ${colorRef('primary')} 45%, transparent)`,
  },
};

export const gradients = {
  primary: {
    value: `linear-gradient(to right, ${colorRef('primary')}, ${colorRef('tertiary')})`,
  },
  primaryHover: {
    value: `linear-gradient(to right, ${colorRef('primaryHover')}, ${colorRef('tertiary')})`,
  },
  secondary: {
    value: `linear-gradient(to right, ${colorRef('primary')}, ${colorRef('secondary')})`,
  },
  neutral: {
    value: `linear-gradient(to right, ${colorRef('neutral', 100)}, ${colorRef('neutral', 200)})`,
  },
};

/** Panda `{gradients.*}` ref. Cmd-click the key to jump to the token. */
export function gradientRef<K extends keyof typeof gradients>(key: K) {
  return `{gradients.${key}}` as `{gradients.${K}}`;
}

export const keyframes = {
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
};

export const breakpoints = {
  sm: '30rem',
  md: '48rem',
  lg: '62rem',
  xl: '80rem',
  '2xl': '96rem',
};

export const colors = {
  brand: {
    becketYellow: { value: 'oklch(0.75 0.15 78)' },
    hiveSage: { value: 'oklch(0.70 0.13 125)' },
    combAmber: { value: 'oklch(0.60 0.16 48)' },
  },
  primary: { value: '{colors.brand.becketYellow}' },
  secondary: { value: '{colors.brand.hiveSage}' },
  tertiary: { value: '{colors.brand.combAmber}' },
  primaryHover: {
    value: 'color-mix(in oklch, {colors.primary} 88%, white)',
  },
  neutral: {
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
  },
  black: { value: 'oklch(20% 0 0)' },
  white: { value: 'oklch(99% 0 0)' },
  border: { value: '{colors.neutral.200}' },
  warning: { value: 'oklch(0.78 0.14 95)' },
  success: { value: 'oklch(0.68 0.16 145)' },
  /** @deprecated Prefer semantic `text` / `background`. Kept as CSS-var aliases. */
  lightBackground: { value: '{colors.neutral.50}' },
  lightText: { value: '{colors.neutral.900}' },
};

export const semanticColors = {
  background: {
    value: {
      base: '{colors.neutral.900}',
      _light: '{colors.neutral.50}',
    },
  },
  text: {
    value: {
      base: '{colors.neutral.50}',
      _light: '{colors.neutral.900}',
    },
  },
  muted: {
    value: {
      base: '{colors.neutral.300}',
      _light: '{colors.neutral.600}',
    },
  },
  /** Overlay / control fill (dialog, field, menu). Cards keep their own surfaces. */
  surface: {
    value: {
      base: '{colors.neutral.800}',
      _light: '{colors.white}',
    },
  },
  /**
   * Error text/borders. One red cannot pass 4.5:1 on both canvases — lighter on
   * dark, darker on light. Never alias a brand hue.
   */
  danger: {
    value: {
      base: 'oklch(0.76 0.16 25)',
      _light: 'oklch(0.48 0.20 25)',
    },
  },
  /**
   * Sage on canvas (outline Button / Badge / Tag). Filled secondary stays
   * `colors.secondary` — one lightness cannot pass AA on both canvases.
   */
  accent: {
    value: {
      base: 'oklch(0.86 0.12 125)',
      _light: 'oklch(0.38 0.14 125)',
    },
  },
};

export const spacing = {
  0: { value: '0rem' },
  1: { value: '0.25rem' },
  2: { value: '0.5rem' },
  3: { value: '0.75rem' },
  5: { value: '1.25rem' },
  8: { value: '2rem' },
  13: { value: '3.25rem' },
  21: { value: '5.25rem' },
  34: { value: '8.5rem' },
  xs: { value: '{spacing.1}' },
  sm: { value: '{spacing.2}' },
  md: { value: '{spacing.3}' },
  lg: { value: '{spacing.5}' },
  xl: { value: '{spacing.8}' },
  '2xs': { value: '{spacing.13}' },
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
    value:
      '0 0 0 2px var(--beckui--colors-background), 0 0 0 4px {colors.primary}',
  },
};

export const gradients = {
  primary: {
    value: 'linear-gradient(to right, {colors.primary}, {colors.tertiary})',
  },
  primaryHover: {
    value: 'linear-gradient(to right, {colors.primaryHover}, {colors.tertiary})',
  },
  secondary: {
    value: 'linear-gradient(to right, {colors.primary}, {colors.secondary})',
  },
  neutral: {
    value: 'linear-gradient(to right, {colors.neutral.100}, {colors.neutral.200})',
  },
};

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

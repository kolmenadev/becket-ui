export type BecketColorValue = string | { dark?: string; light?: string };

export type BecketThemeColors = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  primaryHover?: string;
  background?: BecketColorValue;
  text?: BecketColorValue;
  muted?: BecketColorValue;
  border?: BecketColorValue;
  danger?: BecketColorValue;
  accent?: BecketColorValue;
  /** Cards, dialogs and menus. */
  surface?: BecketColorValue;
  link?: BecketColorValue;
  linkHover?: BecketColorValue;
  linkVisited?: BecketColorValue;
  /** @deprecated Prefer `background: { light }`. */
  lightBackground?: string;
  /** @deprecated Prefer `text: { light }`. */
  lightText?: string;
  warning?: string;
  success?: string;
  neutral?: Partial<
    Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>
  >;
};

export type BecketThemeRadii = Partial<
  Record<'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full', string>
>;

/** `base` resizes all text: every step is a ratio of it. */
export type BecketThemeFontSizes = Partial<
  Record<'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl', string>
>;

/**
 * `unit` (default 0.25rem) resizes every Fibonacci spacing and size step; `textUnit` (default
 * 0.25em) resizes spacing inside running text.
 */
export type BecketThemeSpacing = Partial<Record<'unit' | 'textUnit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;

export type BecketDensityBox = { px?: string; py?: string };

export type BecketThemeDensity = {
  button?: Partial<Record<'sm' | 'md', BecketDensityBox>>;
  field?: Partial<Record<'sm' | 'md' | 'lg', BecketDensityBox>>;
  tag?: Partial<Record<'sm' | 'md' | 'lg', BecketDensityBox>>;
};

export type BecketTheme = {
  colors?: BecketThemeColors;
  radii?: BecketThemeRadii;
  fontSizes?: BecketThemeFontSizes;
  spacing?: BecketThemeSpacing;
  sizes?: { field?: string };
  fonts?: { sans?: string; mono?: string };
  density?: BecketThemeDensity;
};

/** Unlayered `:root` / light-theme CSS. Import or inject after `@becket-ui/tokens/index.css`. */
export function defineBecketTheme(config?: BecketTheme): string;

export const BECKET_PUBLIC_COLOR_KEYS: readonly string[];
export const BECKET_PUBLIC_NEUTRAL_STEPS: readonly string[];

/** A color in OKLCH: lightness 0–1, chroma 0–~0.4, hue in degrees. */
export type Oklch = { L: number; C: number; h: number };

/** Parse hex, rgb(), hsl(), oklch(), black or white. Alpha is ignored. Null when unsupported. */
export function parseColor(input: string): Oklch | null;
/** WCAG 2 contrast ratio, 1–21. Throws on a color it can't read. */
export function contrastRatio(foreground: string | Oklch, background: string | Oklch): number;
/** Lower chroma only until the color fits in sRGB; lightness and hue stay. */
export function toGamut(color: Oklch): Oklch;
export function formatOklch(color: Oklch): string;
export function formatHex(color: Oklch): string;
export function rgbToOklch(rgb: [number, number, number]): Oklch;
/** ΔE OK (Euclidean in OKLab). About 0.02 is a just-noticeable difference. */
export function colorDistance(first: Oklch, second: Oklch): number;

export type BecketColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'primaryHover'
  | 'background'
  | 'text'
  | 'muted'
  | 'surface'
  | 'border'
  | 'danger'
  | 'accent'
  | 'link'
  | 'linkHover'
  | 'linkVisited'
  | 'warning'
  | 'success'
  | 'white'
  | `neutral.${'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'}`;

export type BecketContrastPair = {
  foreground: BecketColorToken;
  background: BecketColorToken;
  /** 4.5 for text, 3 for non-text (WCAG 2.2 1.4.3 / 1.4.11). */
  minimum: number;
  /** `required` pairs pass in the default theme and must pass in yours. `advisory` ones fail in the default too. */
  level: 'required' | 'advisory';
  use: string;
  note?: string;
};

export type BecketContrastResult = BecketContrastPair & {
  theme: 'dark' | 'light';
  ratio: number;
  passes: boolean;
  foregroundColor: string;
  backgroundColor: string;
};

export type BecketContrastReport = {
  /** True when every required pair passes in both themes. */
  passes: boolean;
  failures: BecketContrastResult[];
  advisories: BecketContrastResult[];
  results: BecketContrastResult[];
};

export const contrastPairs: readonly BecketContrastPair[];
/** Final colors in dark and light for a theme, the way the browser resolves defineBecketTheme's CSS. */
export function resolveBecketColors(theme?: BecketTheme): Record<'dark' | 'light', Record<BecketColorToken, Oklch>>;
/** WCAG 2.2 AA check of every pair Becket draws, in both themes. */
export function checkBecketThemeContrast(theme?: BecketTheme): BecketContrastReport;

export type DeriveBecketThemeInput = {
  /** One to three brand colors, most important first: hex, rgb(), hsl() or oklch(). */
  brand: string[];
  /** Colors to keep exactly as given. They are still checked, never changed. */
  pinned?: BecketThemeColors;
};

export type DerivedBecketTheme = {
  /** Pass straight to defineBecketTheme(). */
  theme: BecketTheme;
  /** Why each token has its value: used as is, shaded for contrast, derived or pinned. */
  notes: { token: string; reason: string }[];
  contrast: BecketContrastReport;
};

/**
 * A full color theme from brand colors that passes WCAG 2.2 AA in dark and light. Only
 * lightness moves (and chroma when a shade leaves sRGB); the brand hue never changes.
 * Deterministic: the same input gives the same theme.
 */
export function deriveBecketTheme(input: DeriveBecketThemeInput): DerivedBecketTheme;

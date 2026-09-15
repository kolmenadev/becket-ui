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
  /** @deprecated Prefer `background: { light }`. */
  lightBackground?: string;
  /** @deprecated Prefer `text: { light }`. */
  lightText?: string;
  danger?: string;
  warning?: string;
  success?: string;
  neutral?: Partial<
    Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>
  >;
};

export type BecketThemeRadii = Partial<
  Record<'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full', string>
>;

export type BecketThemeFontSizes = Partial<
  Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl', string>
>;

export type BecketThemeSpacing = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>>;

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

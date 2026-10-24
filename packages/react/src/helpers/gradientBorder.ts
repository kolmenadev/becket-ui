import { css } from '@becket-ui/tokens';
import type { GradientToken } from '@becket-ui/tokens/types';

export type GradientBorderToken = Exclude<GradientToken, 'primaryHover'>;

/** Double-layer border-box fill so left/right caps match the radius (no ::before sliver). */
const outline = {
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
};

// Each backgroundImage is written out: Panda only generates CSS for values it can read at build
// time, and a template string filled in at runtime has none (MAV-143 caught the missing borders).
const gradientBorderClassMap: Record<GradientBorderToken, string> = {
  primary: css(outline, {
    backgroundImage: 'linear-gradient({colors.background}, {colors.background}), {gradients.primary}',
  }),
  secondary: css(outline, {
    backgroundImage: 'linear-gradient({colors.background}, {colors.background}), {gradients.secondary}',
  }),
  neutral: css(outline, {
    backgroundImage: 'linear-gradient({colors.background}, {colors.background}), {gradients.neutral}',
  }),
};

export function isGradientBorderToken(value: unknown): value is GradientBorderToken {
  return typeof value === 'string' && value in gradientBorderClassMap;
}

export function getGradientBorderClassName(token: GradientBorderToken): string {
  return gradientBorderClassMap[token];
}

import { css } from '@becket-ui/tokens';
import type { GradientToken } from '@becket-ui/tokens/tokens';

export type GradientBorderToken = Exclude<GradientToken, 'primaryHover'>;

/** Double-layer border-box fill so left/right caps match the radius (no ::before sliver). */
const outlineGradientBorder = (image: `{gradients.${GradientBorderToken}}`) =>
  css({
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundImage: `linear-gradient({colors.background}, {colors.background}), ${image}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    _light: {
      backgroundImage: `linear-gradient({colors.lightBackground}, {colors.lightBackground}), ${image}`,
    },
  });

const gradientBorderClassMap: Record<GradientBorderToken, string> = {
  primary: outlineGradientBorder('{gradients.primary}'),
  secondary: outlineGradientBorder('{gradients.secondary}'),
  neutral: outlineGradientBorder('{gradients.neutral}'),
};

export function isGradientBorderToken(value: unknown): value is GradientBorderToken {
  return typeof value === 'string' && value in gradientBorderClassMap;
}

export function getGradientBorderClassName(token: GradientBorderToken): string {
  return gradientBorderClassMap[token];
}

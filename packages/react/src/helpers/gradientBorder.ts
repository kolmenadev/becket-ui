import { css } from '@maverick/tokens';
import type { GradientToken } from '@maverick/tokens/tokens';

export type GradientBorderToken = Exclude<GradientToken, 'primaryHover'>;

const baseGradientBorderStyles = {
  position: 'relative',
  bg: 'background',
  _light: {
    bgColor: 'lightBackground',
  },
  backgroundClip: 'padding-box',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'transparent',
} as const;

const gradientBorderClassMap: Record<GradientBorderToken, string> = {
  primary: css({
    ...baseGradientBorderStyles,
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      margin: '-2px',
      zIndex: -1,
      borderRadius: 'inherit',
      backgroundImage: '{gradients.primary}',
    },
  }),
  secondary: css({
    ...baseGradientBorderStyles,
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      margin: '-2px',
      zIndex: -1,
      borderRadius: 'inherit',
      backgroundImage: '{gradients.secondary}',
    },
  }),
  neutral: css({
    ...baseGradientBorderStyles,
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      margin: '-2px',
      zIndex: -1,
      borderRadius: 'inherit',
      backgroundImage: '{gradients.neutral}',
    },
  }),
};

export function isGradientBorderToken(value: unknown): value is GradientBorderToken {
  return typeof value === 'string' && value in gradientBorderClassMap;
}

export function getGradientBorderClassName(token: GradientBorderToken): string {
  return gradientBorderClassMap[token];
}

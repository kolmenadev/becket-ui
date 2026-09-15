import { defineRecipe } from '@pandacss/dev';
import { filledGradient, outlineGradient } from './gradientStyles';

export const badge = defineRecipe({
  className: 'badge',
  description: 'Non-interactive status chip (Badge)',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 'bold',
    letterSpacing: '0.02em',
    lineHeight: 'tight',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--mav-label-border, transparent)',
    bg: 'var(--mav-label-bg, transparent)',
    color: 'var(--mav-label-color, inherit)',
    verticalAlign: 'middle',
    userSelect: 'none',
    textTransform: 'uppercase',
  },
  variants: {
    size: {
      sm: { fontSize: 'xs', px: '2', py: '1' },
      md: { fontSize: 'xs', px: '3', py: '1' },
      lg: { fontSize: 'sm', px: '3', py: '2' },
    },
    visual: {
      primary: {},
      secondary: {},
      neutral: {},
      outline: {},
    },
    borderRadius: {
      none: { borderRadius: 'none' },
      sm: { borderRadius: 'sm' },
      md: { borderRadius: 'md' },
      lg: { borderRadius: 'lg' },
      xl: { borderRadius: 'xl' },
      full: { borderRadius: 'full' },
    },
    withGradient: {
      false: {},
      true: {},
    },
  },
  compoundVariants: [
    {
      withGradient: true,
      css: {
        ...filledGradient('var(--mav-label-gradient, {gradients.primary})'),
        color: 'var(--mav-label-color, {colors.text})',
      },
    },
    {
      visual: 'outline',
      withGradient: true,
      css: {
        ...outlineGradient('var(--mav-label-gradient, {gradients.primary})'),
        color: 'var(--mav-label-color, {colors.secondary})',
        textTransform: 'uppercase',
      },
    },
    {
      visual: 'neutral',
      css: {
        _light: {
          bg: 'var(--mav-label-bg, {colors.neutral.100})',
        },
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    visual: 'neutral',
    borderRadius: 'full',
    withGradient: false,
  },
});

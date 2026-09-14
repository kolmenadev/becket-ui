import { defineRecipe } from '@pandacss/dev';
import { filledGradient, outlineGradient } from './gradientStyles';

export const tag = defineRecipe({
  className: 'tag',
  description: 'Non-interactive metadata chip (Tag)',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 'medium',
    lineHeight: 'tight',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--mav-label-border, transparent)',
    bg: 'var(--mav-label-bg, transparent)',
    color: 'var(--mav-label-color, inherit)',
    verticalAlign: 'middle',
    userSelect: 'none',
  },
  variants: {
    size: {
      sm: { fontSize: 'xs', px: '2', py: '1' },
      md: { fontSize: 'sm', px: '3', py: '1' },
      lg: { fontSize: 'md', px: '3', py: '2' },
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
      },
    },
    {
      visual: 'outline',
      withGradient: true,
      css: {
        ...outlineGradient('var(--mav-label-gradient, {gradients.primary})'),
        color: 'var(--mav-label-color, {colors.secondary})',
      },
    },
    {
      visual: 'neutral',
      css: {
        _light: {
          bg: 'var(--mav-label-bg, {colors.neutral.100})',
          color: 'var(--mav-label-color, {colors.lightText})',
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

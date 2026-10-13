import { defineRecipe } from '@pandacss/dev';

export const box = defineRecipe({
  className: 'box',
  description: 'Generic block with token-only padding, background and radius',
  base: {
    boxSizing: 'border-box',
  },
  variants: {
    padding: {
      none: {},
      xs: { padding: 'xs' },
      sm: { padding: 'sm' },
      md: { padding: 'md' },
      lg: { padding: 'lg' },
      xl: { padding: 'xl' },
    },
    background: {
      none: {},
      background: { bg: 'background', color: 'text' },
      surface: { bg: 'surface', color: 'text' },
      subtle: { bg: 'neutral.800', color: 'text', _light: { bg: 'neutral.50' } },
    },
    radius: {
      none: {},
      sm: { borderRadius: 'sm' },
      md: { borderRadius: 'md' },
      lg: { borderRadius: 'lg' },
      xl: { borderRadius: 'xl' },
      full: { borderRadius: 'full' },
    },
  },
  defaultVariants: {
    padding: 'none',
    background: 'none',
    radius: 'none',
  },
});

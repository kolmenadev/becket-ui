import { defineRecipe } from '@pandacss/dev';

export const icon = defineRecipe({
  className: 'icon',
  description: 'Sizes an inline SVG on the size scale and colors it with currentColor',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    verticalAlign: 'middle',
    lineHeight: 1,
    color: 'currentColor',
    '& > svg': {
      display: 'block',
      width: '100%',
      height: '100%',
    },
  },
  variants: {
    size: {
      sm: { width: '4', height: '4' },
      md: { width: '5', height: '5' },
      lg: { width: '6', height: '6' },
      xl: { width: '8', height: '8' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

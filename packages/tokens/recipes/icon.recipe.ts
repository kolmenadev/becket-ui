import { defineRecipe } from '@pandacss/dev';

export const icon: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'icon',
  description: 'Sizes an inline SVG on the type scale so it matches the text beside it and colors it with currentColor',
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
      sm: { width: '{fontSizes.md}', height: '{fontSizes.md}' },
      md: { width: '{fontSizes.lg}', height: '{fontSizes.lg}' },
      lg: { width: '{fontSizes.xl}', height: '{fontSizes.xl}' },
      xl: { width: '{fontSizes.2xl}', height: '{fontSizes.2xl}' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

import { defineRecipe } from '@pandacss/dev';
import { gradientRef } from '../preset/theme-tokens';

export const heading = defineRecipe({
  className: 'heading',
  description: 'The styles for the Heading component',
  base: {
    fontFamily: 'sans',
    fontWeight: 'bold',
    color: 'text',
    lineHeight: 'tight',
  },
  variants: {
    size: {
      sm: { fontSize: 'sm' },
      md: { fontSize: 'md' },
      lg: { fontSize: 'lg' },
      xl: { fontSize: 'xl' },
      '2xl': { fontSize: '2xl' },
      '3xl': { fontSize: '3xl' },
      '4xl': { fontSize: '4xl' },
      '5xl': { fontSize: '5xl' },
      '6xl': { fontSize: '6xl' },
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
        display: 'inline',
        color: 'transparent',
        backgroundImage: gradientRef('primary'),
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
      },
    },
  ],
  defaultVariants: {
    size: 'xl',
    withGradient: false,
  },
});

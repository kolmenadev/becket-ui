import { defineRecipe } from '@pandacss/dev';

// Typed explicitly: TypeScript infers this recipe's config through Panda's internal RecipeConfig,
// which it can't name in a declaration; defineRecipe's own return type is public (MAV-156).
export const heading: ReturnType<typeof defineRecipe> = defineRecipe({
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
        backgroundImage: '{gradients.primary}',
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

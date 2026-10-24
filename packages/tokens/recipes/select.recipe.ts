import { defineRecipe } from '@pandacss/dev';
import { controlChrome, controlInvalidVariants, controlSizeVariants } from './controlStyles';

const chevron =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\'%3E%3Cpath d=\'M4 6.5 8 10.5 12 6.5\' stroke=\'%23a1a1aa\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")';

// Typed explicitly: TypeScript infers this recipe's config through Panda's internal RecipeConfig,
// which it can't name in a declaration; defineRecipe's own return type is public (MAV-156).
export const selectRecipe: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'select',
  description: 'Native select. Label / helper / error live on Field.',
  base: {
    ...controlChrome,
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: chevron,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right {spacing.3} center',
    backgroundSize: '{fontSizes.md}',
    paddingRight: '8',
  },
  variants: {
    size: controlSizeVariants,
    invalid: controlInvalidVariants,
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

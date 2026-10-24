import { defineRecipe } from '@pandacss/dev';
import { controlChrome, controlInvalidVariants, controlSizeVariants } from './controlStyles';

// Typed explicitly: TypeScript infers this recipe's config through Panda's internal RecipeConfig,
// which it can't name in a declaration; defineRecipe's own return type is public (MAV-156).
export const textareaRecipe: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'textarea',
  description: 'Native textarea. Label / helper / error live on Field.',
  base: {
    ...controlChrome,
    boxSizing: 'border-box',
    resize: 'vertical',
    lineHeight: 'normal',
  },
  variants: {
    size: {
      sm: { ...controlSizeVariants.sm, height: '21', minHeight: '21' },
      md: { ...controlSizeVariants.md, height: '34', minHeight: '34' },
      lg: { ...controlSizeVariants.lg, height: '55', minHeight: '55' },
    },
    invalid: controlInvalidVariants,
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

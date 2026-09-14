import { defineRecipe } from '@pandacss/dev';
import { controlChrome, controlInvalidVariants, controlSizeVariants } from './controlStyles';

export const textareaRecipe = defineRecipe({
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
      sm: { ...controlSizeVariants.sm, height: '5rem', minHeight: '5rem' },
      md: { ...controlSizeVariants.md, height: '8rem', minHeight: '8rem' },
      lg: { ...controlSizeVariants.lg, height: '13rem', minHeight: '13rem' },
    },
    invalid: controlInvalidVariants,
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

import { defineRecipe } from '@pandacss/dev';

export const image: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'image',
  description: 'Responsive image',
  base: { display: 'block', maxWidth: '100%', height: 'auto' },
  variants: {
    fit: {
      cover: { objectFit: 'cover' },
      contain: { objectFit: 'contain' },
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
  defaultVariants: { fit: 'cover', radius: 'none' },
});

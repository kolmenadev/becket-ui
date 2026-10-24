import { defineRecipe } from '@pandacss/dev';

export const center: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'center',
  description: 'Centers its content on both axes',
  base: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  variants: {
    inline: { true: { display: 'inline-flex' }, false: {} },
  },
  defaultVariants: { inline: false },
});

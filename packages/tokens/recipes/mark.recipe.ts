import { defineRecipe } from '@pandacss/dev';

export const mark: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'mark',
  description: 'Highlighted text',
  base: {
    bg: 'primary',
    // Dark ink on brand yellow reads in both themes.
    color: 'neutral.900',
    borderRadius: 'sm',
    paddingInline: 'text-1',
  },
});

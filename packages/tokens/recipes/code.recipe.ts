import { defineRecipe } from '@pandacss/dev';

export const code: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'code',
  description: 'Inline code',
  base: {
    fontFamily: 'mono',
    fontSize: 'text-sm',
    color: 'text',
    bg: 'surface',
    borderRadius: 'sm',
    paddingInline: 'text-1',
    paddingBlock: 'text-1',
    overflowWrap: 'anywhere',
  },
});

import { defineRecipe } from '@pandacss/dev';

export const code = defineRecipe({
  className: 'code',
  description: 'Inline code',
  base: {
    fontFamily: 'mono',
    fontSize: '0.875em',
    color: 'text',
    bg: 'surface',
    borderRadius: 'sm',
    paddingInline: '0.35em',
    paddingBlock: '0.15em',
    overflowWrap: 'anywhere',
  },
});

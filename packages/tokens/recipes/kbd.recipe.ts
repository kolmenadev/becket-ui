import { defineRecipe } from '@pandacss/dev';

export const kbd = defineRecipe({
  className: 'kbd',
  description: 'Keyboard key',
  base: {
    fontFamily: 'mono',
    fontSize: 'text-sm',
    color: 'text',
    bg: 'surface',
    paddingInline: 'text-2',
    paddingBlock: 'text-1',
    borderWidth: '1px',
    borderBottomWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'neutral.700',
    borderRadius: 'sm',
    whiteSpace: 'nowrap',
    _light: { borderColor: 'border' },
  },
});

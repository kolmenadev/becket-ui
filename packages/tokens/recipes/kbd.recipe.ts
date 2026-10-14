import { defineRecipe } from '@pandacss/dev';

export const kbd = defineRecipe({
  className: 'kbd',
  description: 'Keyboard key',
  base: {
    fontFamily: 'mono',
    fontSize: '0.85em',
    color: 'text',
    bg: 'surface',
    paddingInline: '0.4em',
    paddingBlock: '0.1em',
    borderWidth: '1px',
    borderBottomWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'neutral.700',
    borderRadius: 'sm',
    whiteSpace: 'nowrap',
    _light: { borderColor: 'border' },
  },
});

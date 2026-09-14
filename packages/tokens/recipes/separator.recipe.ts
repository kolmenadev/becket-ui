import { defineRecipe } from '@pandacss/dev';

export const separator = defineRecipe({
  className: 'separator',
  description: 'Horizontal or vertical rule',
  base: {
    border: 'none',
    margin: 0,
    backgroundColor: 'neutral.700',
    _light: { backgroundColor: 'border' },
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        width: '100%',
        height: '1px',
      },
      vertical: {
        width: '1px',
        height: 'auto',
        alignSelf: 'stretch',
        minHeight: '1em',
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

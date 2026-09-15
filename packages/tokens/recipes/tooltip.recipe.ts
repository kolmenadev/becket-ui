import { defineRecipe } from '@pandacss/dev';

/** Floating label for hover/focus hints — generic DS primitive. */
export const tooltip = defineRecipe({
  className: 'tooltip',
  description: 'Tooltip content bubble',
  base: {
    position: 'fixed',
    zIndex: 1000,
    maxWidth: '16rem',
    px: '2',
    py: '1',
    borderRadius: 'md',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    bg: 'surface',
    color: 'text',
    fontSize: 'xs',
    fontWeight: 'medium',
    lineHeight: 'tight',
    boxShadow: 'md',
    pointerEvents: 'none',
    whiteSpace: 'normal',
    textAlign: 'left',
    _light: {
      bg: 'neutral.100',
      borderColor: 'neutral.300',
    },
  },
  variants: {
    placement: {
      top: {},
      bottom: {},
      left: {},
      right: {},
    },
  },
  defaultVariants: {
    placement: 'top',
  },
});

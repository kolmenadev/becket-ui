import { defineRecipe } from '@pandacss/dev';
import { visuallyHiddenStyles } from './visually-hidden.recipe';

export const skipLink = defineRecipe({
  className: 'skipLink',
  description: 'Skip-to-content link, visible only when focused',
  base: {
    ...visuallyHiddenStyles,
    _focusVisible: {
      position: 'fixed',
      top: 'md',
      left: 'md',
      // Above any app chrome; the theme has no z-index scale yet.
      zIndex: 1000,
      width: 'auto',
      height: 'auto',
      margin: '0',
      clip: 'auto',
      whiteSpace: 'normal',
      paddingInline: 'md',
      paddingBlock: 'sm',
      bg: 'primary',
      color: 'neutral.900',
      fontWeight: 'bold',
      borderRadius: 'md',
      textDecoration: 'none',
      outline: 'none',
      boxShadow: 'outline',
    },
  },
});

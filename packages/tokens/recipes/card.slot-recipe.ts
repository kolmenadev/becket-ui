import { defineSlotRecipe } from '@pandacss/dev';

export const card = defineSlotRecipe({
  className: 'card',
  description: 'Card container with header, body, and footer slots',
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: 'fit-content',
      maxWidth: '100%',
      borderRadius: 'md',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'sm',
      flexWrap: 'wrap',
      width: '100%',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      flex: 1,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: 'sm',
      width: '100%',
    },
    title: {
      fontFamily: 'sans',
      fontWeight: 'bold',
      color: 'text',
      _light: { color: 'lightText' },
      lineHeight: 'tight',
    },
    description: {
      fontFamily: 'sans',
      color: 'muted',
      lineHeight: 'normal',
      fontSize: 'sm',
    },
  },
  variants: {
    size: {
      sm: {
        root: { gap: 'sm', p: 'sm' },
        header: { gap: '1' },
        title: { fontSize: 'sm' },
        description: { fontSize: 'xs' },
      },
      md: {
        root: { gap: 'md', p: 'md' },
        header: { gap: 'sm' },
        title: { fontSize: 'md' },
        description: { fontSize: 'sm' },
      },
      lg: {
        root: { gap: 'lg', p: 'lg' },
        header: { gap: 'md' },
        title: { fontSize: 'lg' },
        description: { fontSize: 'md' },
      },
    },
    visual: {
      outline: {
        root: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'border',
          bg: 'transparent',
        },
      },
      subtle: {
        root: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'neutral.700',
          bg: 'neutral.800',
          _light: {
            borderColor: 'border',
            bg: 'neutral.50',
          },
        },
      },
      elevated: {
        root: {
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'neutral.700',
          bg: 'neutral.800',
          boxShadow: 'elevated',
          _light: {
            borderColor: 'border',
            bg: 'white',
            boxShadow: 'md',
          },
        },
      },
    },
    fullWidth: {
      true: {
        root: { width: '100%' },
      },
      false: {
        root: { width: 'fit-content', maxWidth: '100%' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    visual: 'subtle',
    fullWidth: false,
  },
});

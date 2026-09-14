import { defineSlotRecipe } from '@pandacss/dev';

export const drawer = defineSlotRecipe({
  className: 'drawer',
  description: 'Side overlay built on native dialog',
  slots: ['root', 'header', 'body', 'footer', 'title', 'close'],
  base: {
    root: {
      maxHeight: '100%',
      height: '100%',
      overflow: 'auto',
      p: 'md',
      borderWidth: '0',
      backgroundColor: 'neutral.800',
      color: 'text',
      boxShadow: 'elevated',
      _light: {
        backgroundColor: 'white',
        color: 'lightText',
        boxShadow: 'lg',
      },
      '&::backdrop': {
        backgroundColor: 'oklch(0% 0 0 / 0.55)',
      },
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'sm',
      mb: 'md',
    },
    title: {
      fontFamily: 'sans',
      fontWeight: 'bold',
      fontSize: 'lg',
      lineHeight: 'tight',
      m: 0,
    },
    body: {
      fontFamily: 'sans',
      fontSize: 'md',
      lineHeight: 'normal',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'sm',
      mt: 'md',
    },
    close: {
      appearance: 'none',
      border: 'none',
      background: 'transparent',
      color: 'muted',
      cursor: 'pointer',
      fontSize: 'xl',
      lineHeight: '1',
      p: '1',
      borderRadius: 'sm',
      _hover: { color: 'text' },
      _light: { _hover: { color: 'lightText' } },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
    },
  },
  variants: {
    placement: {
      start: {
        root: {
          width: '20rem',
          maxWidth: '100%',
          margin: '0 auto 0 0',
          height: '100%',
          maxHeight: '100%',
        },
      },
      end: {
        root: {
          width: '20rem',
          maxWidth: '100%',
          margin: '0 0 0 auto',
          height: '100%',
          maxHeight: '100%',
        },
      },
    },
  },
  defaultVariants: {
    placement: 'end',
  },
});

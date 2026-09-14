import { defineSlotRecipe } from '@pandacss/dev';

export const dialog = defineSlotRecipe({
  className: 'dialog',
  description: 'Native dialog overlay with header, body, and footer slots',
  slots: ['root', 'header', 'body', 'footer', 'title', 'close'],
  base: {
    root: {
      width: 'calc(100% - 2rem)',
      maxWidth: '28rem',
      maxHeight: 'calc(100% - 2rem)',
      overflow: 'auto',
      p: 'md',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'neutral.700',
      borderRadius: 'lg',
      backgroundColor: 'neutral.800',
      color: 'text',
      boxShadow: 'elevated',
      _light: {
        borderColor: 'border',
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
      _light: {
        _hover: { color: 'lightText' },
      },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
    },
  },
});

import { defineSlotRecipe } from '@pandacss/dev';

export const dialog: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'dialog',
  description: 'Native dialog overlay with header, body, and footer slots',
  slots: ['root', 'header', 'body', 'footer', 'title', 'close'],
  base: {
    root: {
      // Panda preflight sets margin: 0, which removes UA dialog centering.
      position: 'fixed',
      inset: '0',
      margin: 'auto',
      height: 'fit-content',
      width: 'calc(100% - {spacing.8})',
      maxWidth: 'md',
      maxHeight: 'calc(100% - {spacing.8})',
      overflow: 'auto',
      p: 'md',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'neutral.700',
      borderRadius: 'lg',
      backgroundColor: 'surface',
      color: 'text',
      boxShadow: 'elevated',
      _light: {
        borderColor: 'border',
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
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 'sm',
      mt: 'md',
      '& > *': {
        width: 'auto',
        flex: '0 1 auto',
      },
    },
    close: {
      appearance: 'none',
      border: 'none',
      background: 'transparent',
      color: 'muted',
      cursor: 'pointer',
      fontSize: 'xl',
      lineHeight: '1',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      // WCAG 2.5.8 minimum target size, the one fixed pixel size allowed off the scale.
      minW: '24px',
      minH: '24px',
      p: '1',
      borderRadius: 'sm',
      _hover: { color: 'text' },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
    },
  },
});

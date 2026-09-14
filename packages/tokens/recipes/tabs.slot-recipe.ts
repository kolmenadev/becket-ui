import { defineSlotRecipe } from '@pandacss/dev';

export const tabs = defineSlotRecipe({
  className: 'tabs',
  description: 'ARIA tabs with list, tab, and panel slots',
  slots: ['root', 'list', 'tab', 'panel'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'md',
    },
    list: {
      display: 'flex',
      gap: '1',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderColor: 'neutral.700',
      _light: { borderColor: 'border' },
    },
    tab: {
      appearance: 'none',
      border: 'none',
      background: 'transparent',
      color: 'muted',
      fontFamily: 'sans',
      fontWeight: 'medium',
      fontSize: 'sm',
      px: 3,
      py: 2,
      cursor: 'pointer',
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent',
      mb: '-1px',
      _hover: { color: 'text' },
      _light: {
        _hover: { color: 'lightText' },
      },
      '&[aria-selected="true"]': {
        color: 'text',
        borderBottomColor: 'primary',
        _light: { color: 'lightText' },
      },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    panel: {
      fontFamily: 'sans',
      fontSize: 'md',
      color: 'text',
      _light: { color: 'lightText' },
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
    },
  },
});

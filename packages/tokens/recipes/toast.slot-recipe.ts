import { defineSlotRecipe } from '@pandacss/dev';

export const toast: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'toast',
  description: 'Fixed notifications region with stacked, auto-dismissing toasts',
  slots: ['region', 'list', 'item'],
  base: {
    region: {
      position: 'fixed',
      insetBlockEnd: 'md',
      insetInlineEnd: 'md',
      // Above app chrome and menus, below the tooltip and skip link; the theme has no z-index scale yet.
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      width: 'sm',
      maxWidth: 'calc(100% - {spacing.8})',
      // The region spans the corner even when empty; only the toasts take clicks.
      pointerEvents: 'none',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'sm',
      m: 0,
      p: 0,
      listStyle: 'none',
      '&:not(:empty) + &:not(:empty)': { mt: 'sm' },
    },
    item: {
      pointerEvents: 'auto',
      boxShadow: 'elevated',
      borderRadius: 'md',
      _light: { boxShadow: 'lg' },
      _motionSafe: {
        animation: 'toastIn 0.2s ease-out',
      },
    },
  },
});

import { defineSlotRecipe } from '@pandacss/dev';

// The status shows as a border and an icon (non-text, 3:1 on surface); the message stays in `text`,
// so it reads the same in every status. The icon's shape differs per status, so color is never the
// only cue, and the border survives forced colors.
export const alert: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'alert',
  description: 'Inline notice with a status icon, optional title, actions and dismiss button',
  slots: ['root', 'icon', 'content', 'title', 'description', 'actions', 'dismiss'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'sm',
      boxSizing: 'border-box',
      width: '100%',
      p: 'md',
      borderWidth: '1px',
      borderInlineStartWidth: '3px',
      borderStyle: 'solid',
      borderRadius: 'md',
      backgroundColor: 'surface',
      color: 'text',
      fontFamily: 'sans',
      fontSize: 'sm',
      lineHeight: 'normal',
    },
    icon: {
      flexShrink: 0,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'xs',
      flex: '1',
      minWidth: 0,
    },
    title: {
      fontWeight: 'bold',
      m: 0,
    },
    description: {
      m: 0,
    },
    actions: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'sm',
      mt: 'xs',
      '& > *': {
        width: 'auto',
        flex: '0 1 auto',
      },
    },
    dismiss: {
      appearance: 'none',
      flexShrink: 0,
      border: 'none',
      background: 'transparent',
      color: 'muted',
      cursor: 'pointer',
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
        outline: '2px solid transparent',
        outlineOffset: '2px',
        boxShadow: 'outline',
      },
    },
  },
  variants: {
    status: {
      info: { root: { borderColor: 'info' }, icon: { color: 'info' } },
      success: { root: { borderColor: 'success' }, icon: { color: 'success' } },
      warning: { root: { borderColor: 'warning' }, icon: { color: 'warning' } },
      danger: { root: { borderColor: 'danger' }, icon: { color: 'danger' } },
    },
  },
  defaultVariants: {
    status: 'info',
  },
});

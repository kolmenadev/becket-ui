import { defineSlotRecipe } from '@pandacss/dev';

const checkMark =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.2 6.6 11.2 12.5 4.8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

export const checkbox = defineSlotRecipe({
  className: 'checkbox',
  description: 'Native checkbox with visible control, label, and optional description',
  slots: ['root', 'control', 'indicator', 'text', 'label', 'description'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: 'sm',
      cursor: 'pointer',
      color: 'text',
      _light: { color: 'lightText' },
      _disabled: { opacity: 0.6, cursor: 'not-allowed' },
    },
    control: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
      _checked: {
        '& + *': {
          backgroundColor: 'primary',
          borderColor: 'primary',
          backgroundImage: checkMark,
          _light: {
            backgroundColor: 'primary',
            borderColor: 'primary',
          },
        },
      },
      _focusVisible: {
        '& + *': {
          boxShadow: 'outline',
        },
      },
    },
    indicator: {
      flexShrink: 0,
      boxSizing: 'border-box',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'neutral.400',
      borderRadius: 'sm',
      backgroundColor: 'neutral.800',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '80%',
      pointerEvents: 'none',
      _light: {
        backgroundColor: 'white',
        borderColor: 'neutral.500',
      },
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      minWidth: 0,
    },
    label: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'sans',
      fontWeight: 'medium',
      lineHeight: '1',
    },
    description: {
      fontFamily: 'sans',
      color: 'muted',
      lineHeight: 'tight',
      _light: { color: 'neutral.600' },
    },
  },
  variants: {
    size: {
      sm: {
        indicator: { width: '1rem', height: '1rem' },
        label: { fontSize: 'sm', minHeight: '1rem' },
        description: { fontSize: 'xs' },
      },
      md: {
        indicator: { width: '1.25rem', height: '1.25rem' },
        label: { fontSize: 'md', minHeight: '1.25rem' },
        description: { fontSize: 'sm' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

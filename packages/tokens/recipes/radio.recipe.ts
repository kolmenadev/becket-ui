import { defineSlotRecipe } from '@pandacss/dev';

const radioDot =
  'radial-gradient(circle, {colors.white} 32%, transparent 34%)';

export const radio = defineSlotRecipe({
  className: 'radio',
  description: 'Native radio with visible control, label, optional description, and group',
  slots: ['group', 'legend', 'root', 'control', 'indicator', 'text', 'label', 'description'],
  base: {
    group: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 'sm',
      margin: 0,
      padding: 0,
      minWidth: 0,
      borderWidth: 0,
    },
    legend: {
      padding: 0,
      marginBottom: '1',
      fontFamily: 'sans',
      fontWeight: 'medium',
      lineHeight: 'tight',
      color: 'text',
    },
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'flex-start',
      gap: 'sm',
      cursor: 'pointer',
      color: 'text',
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
          backgroundImage: radioDot,
          // Same specificity as `_light` on indicator — restate so light does not
          // keep the idle gray ring / white fill.
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
      _invalid: {
        '& + *': {
          borderColor: 'danger',
          _light: { borderColor: 'danger' },
        },
      },
    },
    indicator: {
      flexShrink: 0,
      boxSizing: 'border-box',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'neutral.400',
      borderRadius: 'full',
      backgroundColor: 'neutral.800',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
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
    },
  },
  variants: {
    size: {
      sm: {
        indicator: { width: '1rem', height: '1rem' },
        label: { fontSize: 'sm', minHeight: '1rem' },
        description: { fontSize: 'xs' },
        legend: { fontSize: 'sm' },
      },
      md: {
        indicator: { width: '1.25rem', height: '1.25rem' },
        label: { fontSize: 'md', minHeight: '1.25rem' },
        description: { fontSize: 'sm' },
        legend: { fontSize: 'md' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

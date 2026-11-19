import { defineSlotRecipe } from '@pandacss/dev';

import { checkedHighContrast } from './controlStyles';

export const radio: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
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
          backgroundImage: 'radial-gradient(circle, {colors.white} 32%, transparent 34%)',
          // Forced colors drop the gradient and repaint `primary` as one system color, so the
          // selected radio would match an empty one. Highlight stays, and the dot is a shape.
          _highContrast: {
            ...checkedHighContrast,
            '&::after': {
              content: '"●"',
              color: 'currentColor',
              fontSize: 'xs',
              lineHeight: '1',
            },
          },
          // Same specificity as `_light` on indicator — restate so light does not
          // keep the idle gray ring / white fill. Light also outranks a media query.
          _light: {
            backgroundColor: 'primary',
            borderColor: 'primary',
            _highContrast: checkedHighContrast,
          },
        },
      },
      _focusVisible: {
        // The native input is clipped to 1px, so the outline goes on the drawn circle next to it.
        '& + *': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
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
        indicator: { width: '{fontSizes.md}', height: '{fontSizes.md}' },
        label: { fontSize: 'sm', minHeight: '{fontSizes.md}' },
        description: { fontSize: 'xs' },
        legend: { fontSize: 'sm' },
      },
      md: {
        indicator: { width: '{fontSizes.lg}', height: '{fontSizes.lg}' },
        label: { fontSize: 'md', minHeight: '{fontSizes.lg}' },
        description: { fontSize: 'sm' },
        legend: { fontSize: 'md' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

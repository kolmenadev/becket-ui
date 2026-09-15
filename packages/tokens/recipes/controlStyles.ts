import { fieldSizeStyles } from './density';

/** Shared chrome for native text input, select, and textarea. */
export const controlChrome = {
  width: '100%',
  fontFamily: 'sans',
  color: 'text',
  backgroundColor: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'neutral.500',
  borderRadius: 'md',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  _placeholder: { color: 'muted' },
  _focusVisible: {
    borderColor: 'primary',
    boxShadow: '0 0 0 2px color-mix(in srgb, {colors.primary} 45%, transparent)',
  },
  _disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  _light: {
    borderColor: 'neutral.400',
    _focusVisible: {
      borderColor: 'primary',
      boxShadow: '0 0 0 2px color-mix(in srgb, {colors.primary} 35%, transparent)',
    },
  },
} as const;

export const controlSizeVariants = fieldSizeStyles;

export const controlInvalidVariants = {
  true: {
    borderColor: 'danger',
    _focusVisible: {
      borderColor: 'danger',
      boxShadow: 'outline',
    },
  },
  false: {},
} as const;

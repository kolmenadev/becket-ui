/** Shared chrome for native text input, select, and textarea. */
export const controlChrome = {
  width: '100%',
  fontFamily: 'sans',
  color: 'text',
  backgroundColor: 'neutral.800',
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
    color: 'lightText',
    backgroundColor: 'white',
    borderColor: 'neutral.400',
    _placeholder: { color: 'neutral.500' },
    _focusVisible: {
      borderColor: 'primary',
      boxShadow: '0 0 0 2px color-mix(in srgb, {colors.primary} 35%, transparent)',
    },
  },
} as const;

export const controlSizeVariants = {
  sm: { fontSize: 'sm', px: 2, py: 1 },
  md: { fontSize: 'md', px: 3, py: 2 },
  lg: { fontSize: 'lg', px: 3, py: 3 },
} as const;

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

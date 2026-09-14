import { defineSlotRecipe } from '@pandacss/dev';

/** Generic on/off switch (track + thumb). No product-domain naming. */
export const switchRecipe = defineSlotRecipe({
  className: 'switch',
  description: 'Accessible switch control with track and thumb slots',
  slots: ['root', 'track', 'thumb'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      border: 'none',
      padding: 0,
      background: 'transparent',
      _focusVisible: {
        outline: 'none',
        boxShadow: 'outline',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    track: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 'full',
      bg: 'neutral.600',
      transition: 'background 0.15s ease',
      _light: {
        bg: 'neutral.300',
      },
    },
    thumb: {
      position: 'absolute',
      borderRadius: 'full',
      bg: 'white',
      boxShadow: 'sm',
      transition: 'transform 0.15s ease',
      _light: {
        bg: 'white',
      },
    },
  },
  variants: {
    size: {
      sm: {
        root: { height: '1.25rem' },
        track: { width: '2rem', height: '1.25rem' },
        thumb: { width: '0.875rem', height: '0.875rem', left: '0.1875rem' },
      },
      md: {
        root: { height: '1.5rem' },
        track: { width: '2.75rem', height: '1.5rem' },
        thumb: { width: '1.125rem', height: '1.125rem', left: '0.1875rem' },
      },
      lg: {
        root: { height: '1.75rem' },
        track: { width: '3.25rem', height: '1.75rem' },
        thumb: { width: '1.375rem', height: '1.375rem', left: '0.1875rem' },
      },
    },
    checked: {
      true: {
        track: {
          bg: 'primary',
          _light: { bg: 'primary' },
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      checked: true,
      css: {
        thumb: { transform: 'translateX(0.75rem)' },
      },
    },
    {
      size: 'md',
      checked: true,
      css: {
        thumb: { transform: 'translateX(1.25rem)' },
      },
    },
    {
      size: 'lg',
      checked: true,
      css: {
        thumb: { transform: 'translateX(1.5rem)' },
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    checked: false,
  },
});

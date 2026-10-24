import { defineSlotRecipe } from '@pandacss/dev';

/** Generic on/off switch (track + thumb). No product-domain naming. */
export const switchRecipe: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'switch',
  description: 'Accessible switch control with track and thumb slots',
  slots: ['root', 'track', 'thumb', 'wrap', 'label'],
  base: {
    wrap: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'sm',
    },
    label: {
      fontFamily: 'sans',
      fontSize: 'md',
      color: 'text',
      cursor: 'pointer',
    },
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      height: 'var(--becket-switch-height)',
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
      // 8:5 track, 5:8 thumb: consecutive Fibonacci ratios (about the golden ratio).
      width: 'calc(var(--becket-switch-height) * 8 / 5)',
      height: 'var(--becket-switch-height)',
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
      width: 'calc(var(--becket-switch-height) * 5 / 8)',
      height: 'calc(var(--becket-switch-height) * 5 / 8)',
      left: 'calc(var(--becket-switch-height) * 3 / 16)',
      position: 'absolute',
      borderRadius: 'full',
      bg: 'white',
      boxShadow: 'sm',
      transition: 'transform 0.15s ease',
    },
  },
  variants: {
    // Each size sets the track height on the type scale; the rest is Fibonacci proportion.
    size: {
      sm: { root: { '--becket-switch-height': '{fontSizes.lg}' } },
      md: { root: { '--becket-switch-height': '{fontSizes.xl}' } },
      lg: { root: { '--becket-switch-height': '{fontSizes.2xl}' } },
    },
    checked: {
      true: {
        track: {
          bg: 'primary',
        },
        // Track width minus thumb minus both insets: (8/5 - 5/8 - 3/8) of the height.
        thumb: { transform: 'translateX(calc(var(--becket-switch-height) * 3 / 5))' },
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    checked: false,
  },
});

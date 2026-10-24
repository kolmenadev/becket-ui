import { defineSlotRecipe } from '@pandacss/dev';

export const avatar: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'avatar',
  description: 'Person image with an initials fallback',
  slots: ['root', 'image', 'initials'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: 'full',
      // surface is white in light theme, which disappears on the canvas.
      bg: 'surface',
      _light: { bg: 'neutral.200' },
      color: 'text',
      // Initials scale with the circle at 2:5, a Fibonacci ratio.
      fontSize: 'calc(var(--becket-avatar-size) * 2 / 5)',
      fontWeight: 'medium',
      width: 'var(--becket-avatar-size)',
      height: 'var(--becket-avatar-size)',
      userSelect: 'none',
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    initials: { lineHeight: 1, textTransform: 'uppercase' },
  },
  variants: {
    size: {
      // Consecutive Fibonacci steps: 20, 32, 52 and 84px at a 16px root.
      sm: { root: { '--becket-avatar-size': '{sizes.5}' } },
      md: { root: { '--becket-avatar-size': '{sizes.8}' } },
      lg: { root: { '--becket-avatar-size': '{sizes.13}' } },
      xl: { root: { '--becket-avatar-size': '{sizes.21}' } },
    },
  },
  defaultVariants: { size: 'md' },
});

import { defineSlotRecipe } from '@pandacss/dev';

export const avatar = defineSlotRecipe({
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
      fontWeight: 'medium',
      userSelect: 'none',
    },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    initials: { lineHeight: 1, textTransform: 'uppercase' },
  },
  variants: {
    size: {
      sm: { root: { width: '8', height: '8', fontSize: 'xs' } },
      md: { root: { width: '10', height: '10', fontSize: 'sm' } },
      lg: { root: { width: '12', height: '12', fontSize: 'md' } },
    },
  },
  defaultVariants: { size: 'md' },
});

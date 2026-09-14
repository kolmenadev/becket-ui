import { defineSlotRecipe } from '@pandacss/dev';

export const table = defineSlotRecipe({
  className: 'table',
  description: 'Semantic table slots',
  slots: ['root', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
  base: {
    root: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'sans',
      fontSize: 'sm',
      color: 'text',
      _light: { color: 'lightText' },
    },
    caption: {
      captionSide: 'bottom',
      pt: 'sm',
      color: 'muted',
      fontSize: 'xs',
      textAlign: 'left',
    },
    thead: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderColor: 'neutral.600',
      _light: { borderColor: 'border' },
    },
    tbody: {},
    tfoot: {
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderColor: 'neutral.600',
      _light: { borderColor: 'border' },
    },
    tr: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderColor: 'neutral.700',
      _light: { borderColor: 'neutral.200' },
    },
    th: {
      textAlign: 'left',
      fontWeight: 'medium',
      px: 3,
      py: 2,
    },
    td: {
      px: 3,
      py: 2,
    },
  },
  variants: {
    size: {
      sm: {
        root: { fontSize: 'xs' },
        th: { px: 2, py: 1 },
        td: { px: 2, py: 1 },
      },
      md: {
        root: { fontSize: 'sm' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

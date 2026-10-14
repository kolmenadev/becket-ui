import { defineSlotRecipe } from '@pandacss/dev';

export const blockquote = defineSlotRecipe({
  className: 'blockquote',
  description: 'Quotation with an optional caption',
  slots: ['root', 'quote', 'caption'],
  base: {
    root: { margin: 0, display: 'flex', flexDirection: 'column', gap: 'sm' },
    quote: {
      margin: 0,
      paddingInlineStart: 'md',
      borderInlineStartWidth: '3px',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'primary',
      color: 'text',
      fontStyle: 'italic',
      fontSize: 'lg',
      lineHeight: 'normal',
    },
    caption: { paddingInlineStart: 'md', color: 'muted', fontSize: 'sm' },
  },
});

import { defineSlotRecipe } from '@pandacss/dev';

export const figure = defineSlotRecipe({
  className: 'figure',
  description: 'Figure with a caption',
  slots: ['root', 'caption'],
  base: {
    root: { margin: 0, display: 'flex', flexDirection: 'column', gap: 'sm' },
    caption: { color: 'muted', fontSize: 'sm' },
  },
});

import { defineRecipe } from '@pandacss/dev';

/** The ratio comes from the component as the --becket-aspect-ratio custom property. */
export const aspectRatio = defineRecipe({
  className: 'aspectRatio',
  description: 'Keeps its content at a fixed width-to-height ratio',
  base: {
    position: 'relative',
    width: '100%',
    aspectRatio: 'var(--becket-aspect-ratio, 1)',
    overflow: 'hidden',
    '& > *': {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    },
    '& > img, & > video': { objectFit: 'cover' },
  },
});

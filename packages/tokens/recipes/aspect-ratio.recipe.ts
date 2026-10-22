import { defineRecipe } from '@pandacss/dev';

/**
 * Ratios are consecutive Fibonacci numbers (they approach the golden ratio as they grow), plus
 * 16:9 and 9:16 because video and embeds are produced at those sizes.
 */
export const aspectRatio = defineRecipe({
  className: 'aspectRatio',
  description: 'Keeps its content at a fixed width-to-height ratio',
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    // Doubled class: the child fills the box over its own recipe (Image sets `height: auto`), which
    // Panda 2's recipe order no longer guarantees.
    '&& > *': {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    },
    '& > img, & > video': { objectFit: 'cover' },
  },
  variants: {
    ratio: {
      '1:1': { aspectRatio: '1 / 1' },
      '3:2': { aspectRatio: '3 / 2' },
      '5:3': { aspectRatio: '5 / 3' },
      '8:5': { aspectRatio: '8 / 5' },
      '13:8': { aspectRatio: '13 / 8' },
      '2:3': { aspectRatio: '2 / 3' },
      '3:5': { aspectRatio: '3 / 5' },
      '5:8': { aspectRatio: '5 / 8' },
      '8:13': { aspectRatio: '8 / 13' },
      '16:9': { aspectRatio: '16 / 9' },
      '9:16': { aspectRatio: '9 / 16' },
    },
  },
  defaultVariants: { ratio: '1:1' },
});

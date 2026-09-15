import { css } from '@becket-ui/tokens';

/**
 * Layout-story chips. Each `css()` is a static object so Panda extracts the
 * utilities. Cream ink on `neutral.800` (not inherited `text` on 500–700).
 */
export const demoChip = css({
  color: 'neutral.50',
  bg: 'neutral.800',
  p: 2,
  minW: 13,
  h: 8,
});

export const demoChipMd = css({
  color: 'neutral.50',
  bg: 'neutral.800',
  p: 2,
  minW: 13,
  h: 13,
});

export const demoChipLg = css({
  color: 'neutral.50',
  bg: 'neutral.800',
  p: 2,
  minW: 13,
  h: 21,
});

export const demoChipWide = css({
  color: 'neutral.50',
  bg: 'neutral.800',
  p: 2,
  minW: 13,
  h: 8,
  w: 21,
});

export const demoChipBlock = css({
  color: 'neutral.50',
  bg: 'neutral.800',
  p: 2,
  w: 21,
  h: 8,
});

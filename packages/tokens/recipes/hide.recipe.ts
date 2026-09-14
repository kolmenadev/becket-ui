import { defineRecipe } from '@pandacss/dev';

const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

const breakpointVariants = {
  sm: {},
  md: {},
  lg: {},
  xl: {},
  '2xl': {},
} as const;

export const hide = defineRecipe({
  className: 'hide',
  description: 'Hide children below or from a breakpoint (CSS media queries)',
  variants: {
    below: breakpointVariants,
    from: breakpointVariants,
    asContents: {
      true: {},
      false: {},
    },
  },
  compoundVariants: BREAKPOINTS.flatMap((bp) => [
    {
      below: bp,
      asContents: true,
      css: { display: { base: 'none', [bp]: 'contents' } },
    },
    {
      below: bp,
      asContents: false,
      css: { display: { base: 'none', [bp]: 'block' } },
    },
    {
      from: bp,
      asContents: true,
      css: { display: { base: 'contents', [bp]: 'none' } },
    },
    {
      from: bp,
      asContents: false,
      css: { display: { base: 'block', [bp]: 'none' } },
    },
  ]),
  defaultVariants: {
    asContents: true,
  },
});

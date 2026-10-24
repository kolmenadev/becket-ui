/** Shared Storybook knob values. ConditionalValue props infer as object controls — always override. */

export const gapOptions = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export const flexDirectionOptions = [
  'row',
  'column',
  'row-reverse',
  'column-reverse',
];

export const stackDirectionOptions = ['row', 'column'];

export const alignOptions = ['start', 'center', 'end', 'stretch', 'baseline'];

export const justifyOptions = ['start', 'center', 'end', 'between', 'around', 'evenly'];

export const flexWrapOptions = ['wrap', 'nowrap', 'wrap-reverse'];

export const flexBasisOptions = ['auto', '0', 'full', '8', '13', '21', '34', '1/2', '1/3'];

export const gradientBorderOptions = ['primary', 'secondary', 'neutral'];

export const breakpointOptions = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'mobile',
  'tablet',
  'desktop',
  'largeDesktop',
];

export function knobs(include: string[]) {
  return { controls: { include } };
}

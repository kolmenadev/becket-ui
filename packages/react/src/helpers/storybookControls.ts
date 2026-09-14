/** Shared Storybook knob values. ConditionalValue props infer as object controls — always override. */

export const GAP_OPTIONS = ['xs', 'sm', 'md', 'lg', 'xl', '2xs'] as const;

export const FLEX_DIRECTION_OPTIONS = [
  'row',
  'column',
  'row-reverse',
  'column-reverse',
] as const;

export const STACK_DIRECTION_OPTIONS = ['row', 'column'] as const;

export const ALIGN_OPTIONS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;

export const JUSTIFY_OPTIONS = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;

export const FLEX_WRAP_OPTIONS = ['wrap', 'nowrap', 'wrap-reverse'] as const;

export const FLEX_BASIS_OPTIONS = ['auto', '0', 'full', '8', '13', '21', '34', '1/2', '1/3'] as const;

export const GRADIENT_BORDER_OPTIONS = ['primary', 'secondary', 'neutral'] as const;

export const BREAKPOINT_OPTIONS = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'mobile',
  'tablet',
  'desktop',
  'largeDesktop',
] as const;

export function knobs(include: string[]) {
  return { controls: { include } };
}

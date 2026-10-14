import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { aspectRatio as aspectRatioRecipe } from '@becket-ui/tokens/recipes';

type AspectRatioValue = '1:1' | '3:2' | '5:3' | '8:5' | '13:8' | '2:3' | '3:5' | '5:8' | '8:13' | '16:9' | '9:16';

export type AspectRatioProps = ComponentPropsWithoutRef<'div'> & {
  /** Width to height. Default `'1:1'`. */
  ratio?: AspectRatioValue;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Keeps one child (image, video, iframe, map) at a fixed ratio; the child fills the box.
 * Ratios are Fibonacci pairs (`'3:2'`, `'8:5'`, `'13:8'` and their portrait flips) plus `'16:9'`
 * and `'9:16'` for video. Default `'1:1'`.
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(({ ratio, className, ...props }, ref) => (
  <div ref={ref} {...props} className={mergeClassName(aspectRatioRecipe({ ratio }), className)} />
));

AspectRatio.displayName = 'AspectRatio';

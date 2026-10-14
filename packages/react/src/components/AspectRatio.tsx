import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { aspectRatio as aspectRatioRecipe } from '@becket-ui/tokens/recipes';

export type AspectRatioProps = ComponentPropsWithoutRef<'div'> & {
  /** Width divided by height, e.g. 16 / 9. Default 1 (square). */
  ratio?: number;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Keeps one child (image, video, iframe, map) at a fixed ratio; the child fills the box. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, style, ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      // The ratio is per instance, so it travels as a custom property the recipe reads.
      style={{ ...style, '--becket-aspect-ratio': String(ratio) } as CSSProperties}
      className={mergeClassName(aspectRatioRecipe(), className)}
    />
  ),
);

AspectRatio.displayName = 'AspectRatio';

import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { visuallyHidden as visuallyHiddenRecipe } from '@becket-ui/tokens/recipes';

export type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'> & {
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Text for screen readers only, e.g. a label for an icon-only control. */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ as: Component = 'span', className, ...props }, ref) => (
    <Component ref={ref} {...props} className={mergeClassName(visuallyHiddenRecipe(), className)} />
  ),
);

VisuallyHidden.displayName = 'VisuallyHidden';

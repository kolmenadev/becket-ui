import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { mark as markRecipe } from '@becket-ui/tokens/recipes';

export type MarkProps = ComponentPropsWithoutRef<'mark'>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Highlighted text. */
export const Mark = forwardRef<HTMLElement, MarkProps>(({ className, ...props }, ref) => (
  <mark ref={ref} {...props} className={mergeClassName(markRecipe(), className)} />
));

Mark.displayName = 'Mark';

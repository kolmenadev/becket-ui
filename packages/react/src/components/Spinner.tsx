import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { spinner as spinnerRecipe } from '@becket-ui/tokens/recipes';

import { VisuallyHidden } from './VisuallyHidden';

type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  size?: SpinnerSize;
  /** Text a screen reader reads from the status region; defaults to "Loading". */
  label?: ReactNode;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', label = 'Loading', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        {...props}
        className={mergeClassName(spinnerRecipe({ size }), className)}
      >
        <VisuallyHidden>{label}</VisuallyHidden>
      </span>
    );
  },
);

Spinner.displayName = 'Spinner';

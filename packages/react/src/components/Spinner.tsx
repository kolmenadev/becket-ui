import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { spinner as spinnerRecipe } from '@becket-ui/tokens/recipes';

type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  size?: SpinnerSize;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        {...props}
        aria-label={props['aria-label'] ?? 'Loading'}
        className={mergeClassName(spinnerRecipe({ size }), className)}
      />
    );
  },
);

Spinner.displayName = 'Spinner';

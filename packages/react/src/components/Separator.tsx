import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { separator as separatorRecipe } from '@becket-ui/tokens/recipes';

type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorProps = ComponentPropsWithoutRef<'hr'> & {
  orientation?: SeparatorOrientation;
  /** When true, hide from the accessibility tree (decorative). */
  decorative?: boolean;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', decorative = false, className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        {...props}
        className={mergeClassName(separatorRecipe({ orientation }), className)}
        aria-orientation={orientation}
        aria-hidden={decorative ? true : undefined}
      />
    );
  },
);

Separator.displayName = 'Separator';

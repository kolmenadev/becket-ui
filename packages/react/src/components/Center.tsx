import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { center as centerRecipe } from '@becket-ui/tokens/recipes';

export type CenterProps = ComponentPropsWithoutRef<'div'> & {
  /** inline-flex instead of flex, e.g. to center an icon inside text. */
  inline?: boolean;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ inline = false, as: Component = 'div', className, ...props }, ref) => (
    <Component ref={ref} {...props} className={mergeClassName(centerRecipe({ inline }), className)} />
  ),
);

Center.displayName = 'Center';

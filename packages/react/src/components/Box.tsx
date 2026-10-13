import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { box as boxRecipe } from '@becket-ui/tokens/recipes';

type BoxSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type BoxBackground = 'none' | 'background' | 'surface' | 'subtle';
type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type BoxProps = ComponentPropsWithoutRef<'div'> & {
  padding?: BoxSpacing;
  /** Token surfaces only; text color follows the theme. */
  background?: BoxBackground;
  radius?: BoxRadius;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    { padding = 'none', background = 'none', radius = 'none', as: Component = 'div', className, ...props },
    ref,
  ) => (
    <Component
      ref={ref}
      {...props}
      className={mergeClassName(boxRecipe({ padding, background, radius }), className)}
    />
  ),
);

Box.displayName = 'Box';

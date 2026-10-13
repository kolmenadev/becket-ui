import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { container as containerRecipe } from '@becket-ui/tokens/recipes';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  /** Max width from the size scale: sm 48rem, md 64rem, lg 72rem, xl 80rem, full none. */
  size?: ContainerSize;
  /** Inline (left and right) page gutter. Vertical spacing belongs to Stack. */
  padding?: ContainerPadding;
  /** Render as a landmark, e.g. `main` or `section`. */
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', padding = 'md', as: Component = 'div', className, ...props }, ref) => (
    <Component
      ref={ref}
      {...props}
      className={mergeClassName(containerRecipe({ size, padding }), className)}
    />
  ),
);

Container.displayName = 'Container';

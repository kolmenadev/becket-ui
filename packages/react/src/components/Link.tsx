import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { link as linkRecipe } from '@becket-ui/tokens/recipes';

type LinkVisual = 'default' | 'muted';

export type LinkProps = ComponentPropsWithoutRef<'a'> & {
  visual?: LinkVisual;
  visited?: boolean;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ visual = 'default', visited = false, as: Comp = 'a', className, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        {...props}
        className={mergeClassName(linkRecipe({ visual, visited }), className)}
      />
    );
  },
);

Link.displayName = 'Link';

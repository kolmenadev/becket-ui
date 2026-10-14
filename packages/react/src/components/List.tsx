import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { list as listRecipe } from '@becket-ui/tokens/recipes';

type ListSpacing = 'xs' | 'sm' | 'md';
type ListMarker = 'disc' | 'decimal' | 'none';

export type ListProps = ComponentPropsWithoutRef<'ul'> & {
  /** `ol` for ordered steps; defaults the marker to decimal. */
  as?: 'ul' | 'ol';
  spacing?: ListSpacing;
  marker?: ListMarker;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const List = forwardRef<HTMLUListElement & HTMLOListElement, ListProps>(
  ({ as: Component = 'ul', spacing = 'sm', marker, className, ...props }, ref) => (
    <Component
      ref={ref}
      {...props}
      className={mergeClassName(
        listRecipe({ spacing, marker: marker ?? (Component === 'ol' ? 'decimal' : 'disc') }),
        className,
      )}
    />
  ),
);

List.displayName = 'List';

export type ListItemProps = ComponentPropsWithoutRef<'li'>;

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>((props, ref) => <li ref={ref} {...props} />);

ListItem.displayName = 'ListItem';

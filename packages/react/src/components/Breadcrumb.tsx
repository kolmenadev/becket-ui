import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { breadcrumb as breadcrumbRecipe } from '@becket-ui/tokens/recipes';

export type BreadcrumbProps = ComponentPropsWithoutRef<'nav'> & {
  size?: 'sm' | 'md';
  /** Drawn between items in CSS; screen readers don't read it. Default `chevron`. */
  separator?: 'chevron' | 'slash';
};

/**
 * The trail of pages leading to the current one: a `nav` landmark around an ordered list of
 * `BreadcrumbItem`s. Renders without client JS.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      size = 'sm',
      separator = 'chevron',
      className,
      children,
      'aria-label': ariaLabel = 'Breadcrumb',
      ...props
    },
    ref,
  ) => {
    const styles = breadcrumbRecipe({ size, separator });
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        {...props}
        className={[styles.root, className].filter(Boolean).join(' ')}
      >
        <ol className={styles.list}>{children}</ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';

export type BreadcrumbItemProps = ComponentPropsWithoutRef<'a'> & {
  /** The page the user is on: `aria-current="page"`. Without `href`, it renders as plain text. */
  current?: boolean;
  /** Router link component (for example Next's `Link`) for the link. Default `a`. */
  as?: ElementType;
};

/** One page in a `Breadcrumb`. The ref goes to the link (or the text of a current page). */
export const BreadcrumbItem = forwardRef<HTMLElement, BreadcrumbItemProps>(
  ({ current = false, as: LinkComponent = 'a', href, className, ...props }, ref) => {
    const styles = breadcrumbRecipe();
    return (
      <li className={styles.item}>
        {current && href === undefined ? (
          <span
            ref={ref}
            aria-current="page"
            {...props}
            className={[styles.link, className].filter(Boolean).join(' ')}
          />
        ) : (
          <LinkComponent
            ref={ref}
            href={href}
            aria-current={current ? 'page' : undefined}
            {...props}
            className={[styles.link, className].filter(Boolean).join(' ')}
          />
        )}
      </li>
    );
  },
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

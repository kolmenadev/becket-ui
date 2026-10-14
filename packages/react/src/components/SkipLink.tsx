import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { skipLink as skipLinkRecipe } from '@becket-ui/tokens/recipes';

export type SkipLinkProps = ComponentPropsWithoutRef<'a'>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * First focusable element on the page: lets keyboard users jump past the
 * navigation. Hidden until focused. Point `href` at the main landmark's id.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href = '#main', children = 'Skip to content', className, ...props }, ref) => (
    <a ref={ref} href={href} {...props} className={mergeClassName(skipLinkRecipe(), className)}>
      {children}
    </a>
  ),
);

SkipLink.displayName = 'SkipLink';

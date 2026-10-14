import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { prose as proseRecipe } from '@becket-ui/tokens/recipes';

type ProseSize = 'sm' | 'md' | 'lg';

export type ProseProps = ComponentPropsWithoutRef<'div'> & {
  /** Base text size; headings, spacing and code scale with it. */
  size?: ProseSize;
  /** Usually `article` for a blog post. */
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Styles HTML from Markdown or MDX with Becket tokens. CSS only, no JS.
 * Wrap embedded components in `data-not-prose` to keep their own styles.
 */
export const Prose = forwardRef<HTMLDivElement, ProseProps>(
  ({ size = 'md', as: Component = 'div', className, ...props }, ref) => (
    <Component ref={ref} {...props} className={mergeClassName(proseRecipe({ size }), className)} />
  ),
);

Prose.displayName = 'Prose';

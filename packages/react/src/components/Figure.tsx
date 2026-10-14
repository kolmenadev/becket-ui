import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { figure as figureRecipe } from '@becket-ui/tokens/recipes';

export type FigureProps = ComponentPropsWithoutRef<'figure'> & {
  /** Rendered as <figcaption> after the content. */
  caption?: ReactNode;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Image, chart or code with a caption. */
export const Figure = forwardRef<HTMLElement, FigureProps>(({ caption, className, children, ...props }, ref) => {
  const styles = figureRecipe();
  return (
    <figure ref={ref} {...props} className={mergeClassName(styles.root, className)}>
      {children}
      {caption != null && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
});

Figure.displayName = 'Figure';

import { Children, forwardRef, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { blockquote as blockquoteRecipe } from '@becket-ui/tokens/recipes';

export type BlockquoteProps = ComponentPropsWithoutRef<'figure'> & {
  /** URL of the source, set on the <blockquote cite> attribute. */
  cite?: string;
  children?: ReactNode;
};

export type BlockquoteCaptionProps = ComponentPropsWithoutRef<'figcaption'>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const BlockquoteCaption = forwardRef<HTMLElement, BlockquoteCaptionProps>(({ className, ...props }, ref) => (
  <figcaption ref={ref} {...props} className={mergeClassName(blockquoteRecipe().caption, className)} />
));

BlockquoteCaption.displayName = 'BlockquoteCaption';

/**
 * A quotation. Renders <figure><blockquote/><figcaption/></figure> so the caption
 * (who said it) sits outside the quote, as HTML requires.
 */
export const Blockquote = forwardRef<HTMLElement, BlockquoteProps>(({ cite, className, children, ...props }, ref) => {
  const styles = blockquoteRecipe();
  const items = Children.toArray(children);
  const captions = items.filter((child) => isValidElement(child) && child.type === BlockquoteCaption);
  const quote = items.filter((child) => !(isValidElement(child) && child.type === BlockquoteCaption));
  return (
    <figure ref={ref} {...props} className={mergeClassName(styles.root, className)}>
      <blockquote cite={cite} className={styles.quote}>
        {quote}
      </blockquote>
      {captions}
    </figure>
  );
});

Blockquote.displayName = 'Blockquote';

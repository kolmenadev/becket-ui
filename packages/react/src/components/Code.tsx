import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { code as codeRecipe } from '@becket-ui/tokens/recipes';

export type CodeProps = ComponentPropsWithoutRef<'code'>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Inline code. Use CodeBlock (MAV-114) for multi-line code. */
export const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code ref={ref} {...props} className={mergeClassName(codeRecipe(), className)} />
));

Code.displayName = 'Code';

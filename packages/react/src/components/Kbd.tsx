import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { kbd as kbdRecipe } from '@becket-ui/tokens/recipes';

export type KbdProps = ComponentPropsWithoutRef<'kbd'>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** A keyboard key or shortcut, e.g. <Kbd>⌘</Kbd> <Kbd>K</Kbd>. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd ref={ref} {...props} className={mergeClassName(kbdRecipe(), className)} />
));

Kbd.displayName = 'Kbd';

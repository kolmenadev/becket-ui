import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { icon as iconRecipe } from '@becket-ui/tokens/recipes';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

export type IconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** sm 1rem, md 1.25rem, lg 1.5rem, xl 2rem. */
  size?: IconSize;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
  /** One inline `<svg>`, drawn with `currentColor`. */
  children: ReactNode;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ size = 'md', label, className, children, ...props }, ref) => (
    <span
      ref={ref}
      {...props}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={mergeClassName(iconRecipe({ size }), className)}
    >
      {children}
    </span>
  ),
);

Icon.displayName = 'Icon';

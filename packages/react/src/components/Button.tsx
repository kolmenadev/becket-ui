import { forwardRef } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { button } from '@becket-ui/tokens/recipes';

type ButtonVisual = 'outline' | 'primary' | 'secondary' | 'neutral';
type ButtonSize = 'sm' | 'md';
type ButtonBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const VISUAL_TO_RECIPE: Record<ButtonVisual, ButtonVisual> = {
  primary: 'primary',
  secondary: 'secondary',
  neutral: 'neutral',
  outline: 'outline',
};

type ButtonOwnProps = {
  visual?: ButtonVisual;
  size?: ButtonSize;
  borderRadius?: ButtonBorderRadius;
  withGradient?: boolean;
  /** Stretch to the parent width. Default is token `sizes.field` (12.5rem). */
  fullWidth?: boolean;
};

/**
 * Props follow the rendered element: `<Button as="a" href="/docs">` accepts anchor props,
 * and plain `<Button>` accepts button props only.
 */
export type ButtonProps<T extends ElementType = 'button'> = ButtonOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | 'as'>;

type PolymorphicButton = (<T extends ElementType = 'button'>(
  props: ButtonProps<T> & { ref?: ComponentPropsWithRef<T>['ref'] },
) => ReactElement | null) & { displayName?: string };

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// forwardRef can't express a generic component; the cast restores the per-element prop types.
export const Button = forwardRef<HTMLElement, ButtonOwnProps & { as?: ElementType; className?: string }>(
  (
    {
      visual = 'outline',
      size = 'md',
      borderRadius = 'md',
      withGradient = false,
      fullWidth = false,
      as: ButtonComponent = 'button',
      className,
      ...props
    },
    ref,
  ) => {
    const recipeClassName = (button)({
      visual: VISUAL_TO_RECIPE[visual],
      size,
      borderRadius,
      withGradient,
      fullWidth,
    });

    return (
      <ButtonComponent
        ref={ref}
        {...(ButtonComponent === 'button' ? { type: 'button' as const } : {})}
        {...props}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
) as PolymorphicButton;

Button.displayName = 'Button';

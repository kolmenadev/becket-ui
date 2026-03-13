import { ElementType, forwardRef } from 'react';
import { button } from '@maverick/tokens/recipes';

type ButtonVisual = 'outline' | 'primary' | 'secondary' | 'neutral';
type ButtonSize = 'sm' | 'md';

const VISUAL_TO_RECIPE: Record<ButtonVisual, ButtonVisual> = {
  primary: 'primary',
  secondary: 'secondary',
  neutral: 'neutral',
  outline: 'outline',
};

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  visual?: ButtonVisual;
  size?: ButtonSize;
  withGradient?: boolean;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      visual = 'outline',
      size = 'md',
      withGradient = false,
      as: ButtonComponent = 'button',
      className,
      ...props
    },
    ref,
  ) => {
    const recipeClassName = (button)({
      visual: VISUAL_TO_RECIPE[visual],
      size,
      withGradient,
    });

    return (
      <ButtonComponent
        ref={ref}
        {...props}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
);

Button.displayName = 'Button';

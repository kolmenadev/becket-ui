import { ElementType, forwardRef } from 'react';
import { heading as headingRecipe } from '@maverick/tokens/recipes';

type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

type HeadingProps = React.ComponentPropsWithoutRef<'h2'> & {
  size?: HeadingSize;
  withGradient?: boolean;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      size = 'xl',
      withGradient = false,
      as: HeadingComponent = 'h2',
      className,
      ...props
    },
    ref,
  ) => {
    const recipeClassName = headingRecipe({
      size,
      withGradient,
    });

    return (
      <HeadingComponent
        ref={ref}
        {...props}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
);

Heading.displayName = 'Heading';

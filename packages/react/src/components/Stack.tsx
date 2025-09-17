import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import { stack } from '@maverick/tokens/patterns';

type StackOptions = NonNullable<Parameters<typeof stack>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export const Stack = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    direction?: StackOptions['direction'];
    gap?: StackOptions['gap'];
    align?: AlignVariant | StackOptions['align'];
    justify?: JustifyVariant | StackOptions['justify'];
    as?: ElementType;
  }
>(
  (
    {
      direction = 'column',
      gap = 'md',
      align,
      justify,
      as: Component = 'div',
      className,
      ...props
    },
    ref,
  ) => {
    const alignCss = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align;

    const justifyCss =
      justify === 'start'
        ? 'flex-start'
        : justify === 'end'
          ? 'flex-end'
          : justify === 'between'
            ? 'space-between'
            : justify === 'around'
              ? 'space-around'
              : justify === 'evenly'
                ? 'space-evenly'
                : justify;

    return (
      <Component
        ref={ref}
        className={stack({ direction, gap, align: alignCss, justify: justifyCss })}
        {...props}
      />
    );
  },
);

Stack.displayName = 'Stack';

type StackProps = ComponentPropsWithoutRef<'div'> & {
  direction?: StackOptions['direction'];
  gap?: StackOptions['gap'];
  align?: AlignVariant | StackOptions['align'];
  justify?: JustifyVariant | StackOptions['justify'];
  as?: ElementType;
};

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
));
HStack.displayName = 'HStack';

export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
));
VStack.displayName = 'VStack';

import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import { stack } from '@maverick/tokens/patterns';

type StackOptions = NonNullable<Parameters<typeof stack>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const ALIGN_MAP: Record<AlignVariant, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<JustifyVariant, string> = {
  start: 'start',
  center: 'center',
  end: 'end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Stack = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    direction?: StackOptions['direction'];
    gap?: StackOptions['gap'];
    align?: AlignVariant;
    justify?: JustifyVariant;
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
    const recipeClassName = stack({
      direction,
      gap,
      ...(align && { align: ALIGN_MAP[align] }),
      ...(justify && { justify: JUSTIFY_MAP[justify] }),
    });

    return (
      <Component
        ref={ref}
        {...props}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
);

Stack.displayName = 'Stack';

type StackProps = ComponentPropsWithoutRef<'div'> & {
  direction?: StackOptions['direction'];
  gap?: StackOptions['gap'];
  align?: AlignVariant;
  justify?: JustifyVariant;
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

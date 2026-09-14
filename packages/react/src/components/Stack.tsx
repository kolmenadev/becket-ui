import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { css } from '@becket-ui/tokens/css';
import { stack } from '@becket-ui/tokens/patterns';
import {
  getGradientBorderClassName,
  isGradientBorderToken,
  type GradientBorderToken,
} from '../helpers/gradientBorder';
import { normalizeGapValue, normalizeResponsiveValue, type GapValue, type ResponsiveValue } from '../helpers/responsive';

type StackOptions = NonNullable<Parameters<typeof stack>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type BorderProp = StackOptions['border'] | GradientBorderToken;

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

export type StackProps = ComponentPropsWithoutRef<'div'> & {
  direction?: StackOptions['direction'];
  gap?: GapValue;
  align?: AlignVariant;
  justify?: JustifyVariant;
  border?: BorderProp;
  /** Flex/grid order — responsive object supported (KAN-120). */
  order?: ResponsiveValue<number>;
  as?: ElementType;
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'column',
      gap = 'md',
      align,
      justify,
      border,
      order,
      as: Component = 'div',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const isGradientBorder = isGradientBorderToken(border);
    const resolvedGap = normalizeGapValue(gap);
    const resolvedDirection = normalizeResponsiveValue(direction);
    const resolvedOrder = order != null ? normalizeResponsiveValue(order) : undefined;

    const recipeClassName = css({
      ...stack.raw({
        direction: resolvedDirection as StackOptions['direction'],
        gap: resolvedGap as StackOptions['gap'],
        ...(align && { align: ALIGN_MAP[align] }),
        ...(justify && { justify: JUSTIFY_MAP[justify] }),
        ...(border && !isGradientBorder && { border }),
      }),
      ...(resolvedOrder != null && { order: resolvedOrder }),
    });

    const gradientBorderClassName = isGradientBorder
      ? getGradientBorderClassName(border)
      : undefined;

    return (
      <Component
        ref={ref}
        {...props}
        style={style}
        className={mergeClassName(
          recipeClassName,
          gradientBorderClassName,
          className,
        )}
      />
    );
  },
);

Stack.displayName = 'Stack';

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
));
HStack.displayName = 'HStack';

export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
));
VStack.displayName = 'VStack';

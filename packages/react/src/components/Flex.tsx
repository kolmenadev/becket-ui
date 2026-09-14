import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { css } from '@becket-ui/tokens/css';
import { flex } from '@becket-ui/tokens/patterns';
import {
  getGradientBorderClassName,
  isGradientBorderToken,
  type GradientBorderToken,
} from '../helpers/gradientBorder';
import { normalizeGapValue, normalizeResponsiveValue, type GapValue, type ResponsiveValue } from '../helpers/responsive';

type FlexOptions = NonNullable<Parameters<typeof flex>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type BorderProp = FlexOptions['border'] | GradientBorderToken;

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

export type FlexProps = ComponentPropsWithoutRef<'div'> & {
  direction?: FlexOptions['direction'];
  gap?: GapValue;
  align?: AlignVariant;
  justify?: JustifyVariant;
  wrap?: FlexOptions['wrap'];
  basis?: FlexOptions['basis'];
  grow?: FlexOptions['grow'];
  shrink?: FlexOptions['shrink'];
  inline?: boolean;
  border?: BorderProp;
  order?: ResponsiveValue<number>;
  as?: ElementType;
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      gap = 'md',
      align,
      justify,
      wrap,
      basis,
      grow,
      shrink,
      inline = false,
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
      ...flex.raw({
        direction: resolvedDirection as FlexOptions['direction'],
        gap: resolvedGap as FlexOptions['gap'],
        ...(align && { align: ALIGN_MAP[align] }),
        ...(justify && { justify: JUSTIFY_MAP[justify] }),
        ...(wrap != null && { wrap }),
        ...(basis != null && { basis }),
        ...(grow != null && { grow }),
        ...(shrink != null && { shrink }),
        ...(border && !isGradientBorder && { border }),
        ...(inline && { display: 'inline-flex' }),
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

Flex.displayName = 'Flex';

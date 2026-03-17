import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import { flex } from '@maverick/tokens/patterns';
import {
  getGradientBorderClassName,
  isGradientBorderToken,
  type GradientBorderToken,
} from '../helpers/gradientBorder';

type FlexOptions = NonNullable<Parameters<typeof flex>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type GapVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs';
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

export const Flex = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    direction?: FlexOptions['direction'];
    gap?: GapVariant | FlexOptions['gap'];
    align?: AlignVariant;
    justify?: JustifyVariant;
    wrap?: FlexOptions['wrap'];
    basis?: FlexOptions['basis'];
    grow?: FlexOptions['grow'];
    shrink?: FlexOptions['shrink'];
    inline?: boolean;
    border?: BorderProp;
    as?: ElementType;
  }
>(
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
      as: Component = 'div',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const isGradientBorder = isGradientBorderToken(border);

    const recipeClassName = flex({
      direction,
      gap,
      ...(align && { align: ALIGN_MAP[align] }),
      ...(justify && { justify: JUSTIFY_MAP[justify] }),
      ...(wrap && { wrap }),
      ...(basis && { basis }),
      ...(grow && { grow }),
      ...(shrink && { shrink }),
      ...(border && !isGradientBorder && { border }),
      ...(inline && { display: 'inline-flex' }),
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

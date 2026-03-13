import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import { flex } from '@maverick/tokens/patterns';

type FlexOptions = NonNullable<Parameters<typeof flex>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type GapVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs';

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
      as: Component = 'div',
      className,
      ...props
    },
    ref,
  ) => {

    const recipeClassName = flex({
      direction,
      gap,
      ...(align && { align: ALIGN_MAP[align] }),
      ...(justify && { justify: JUSTIFY_MAP[justify] }),
      ...(wrap && { wrap }),
      ...(basis && { basis }),
      ...(grow && { grow }),
      ...(shrink && { shrink }),
      ...(inline && { display: 'inline-flex' }),
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

Flex.displayName = 'Flex';

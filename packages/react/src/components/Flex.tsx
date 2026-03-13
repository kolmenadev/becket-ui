import { ComponentPropsWithoutRef, ElementType, forwardRef } from 'react';
import { flex } from '@maverick/tokens/patterns';

type FlexOptions = NonNullable<Parameters<typeof flex>[0]>;
type AlignVariant = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyVariant = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type GapVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs';

// Use logical values (start, end) that match Panda's generated CSS classes.
// Mapping to flex-start/flex-end produces jc_flex-end etc., which aren't in the pre-generated CSS.
const ALIGN_MAP: Partial<Record<AlignVariant, string>> = {
  start: 'start',
  end: 'end',
};

const JUSTIFY_MAP: Partial<Record<JustifyVariant, string>> = {
  start: 'start',
  end: 'end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export const Flex = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    direction?: FlexOptions['direction'];
    gap?: GapVariant | FlexOptions['gap'];
    align?: AlignVariant | FlexOptions['align'];
    justify?: JustifyVariant | FlexOptions['justify'];
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
    const alignCss = ALIGN_MAP[align as AlignVariant] ?? align;
    const justifyCss = JUSTIFY_MAP[justify as JustifyVariant] ?? justify;

    return (
      <Component
        ref={ref}
        className={flex({
          direction,
          gap,
          align: alignCss,
          justify: justifyCss,
          wrap,
          basis,
          grow,
          shrink,
          ...(inline && { display: 'inline-flex' }),
        })}
        {...props}
      />
    );
  },
);

Flex.displayName = 'Flex';

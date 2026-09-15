/**
 * Chakra-style visibility helper.
 * Uses CSS media queries — no JS flash; single DOM for UI tests.
 */

import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { hide } from '@becket-ui/tokens/recipes';
import type { HideVariantProps } from '@becket-ui/tokens/recipes';

import { resolveBreakpointAlias, type BreakpointAlias } from '../helpers/responsive';

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

type HideBreakpoint = NonNullable<HideVariantProps['below']>;

function asHideBreakpoint(token: string): HideBreakpoint | undefined {
  if (token === 'sm' || token === 'md' || token === 'lg' || token === 'xl' || token === '2xl') {
    return token;
  }
  return undefined;
}

export type HideProps = ComponentPropsWithoutRef<'div'> & {
  /** Hide when viewport is **below** this breakpoint (show from breakpoint up). */
  below?: BreakpointAlias;
  /** Hide from this breakpoint **and up** (show only below). */
  from?: BreakpointAlias;
  /**
   * When visible, use `display: contents` so the wrapper does not affect flex/grid
   * (Chakra Show/Hide pattern). Set `false` for a real block box.
   */
  asContents?: boolean;
  as?: ElementType;
};

/**
 * Conditionally hide children by breakpoint.
 * Prefer over duplicating trees for mobile/desktop — keeps `data-testid` stable.
 *
 * @example
 * <Hide below="desktop">{sidebar}</Hide>
 * <Hide from="desktop">{mobileOnlyNav}</Hide>
 */
export const Hide = forwardRef<HTMLDivElement, HideProps>(
  (
    {
      below,
      from,
      asContents = true,
      as: Component = 'div',
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    if ((below && from) || (!below && !from)) {
      console.warn('Hide: pass exactly one of `below` or `from`.');
    }

    const belowBp = below ? asHideBreakpoint(resolveBreakpointAlias(below)) : undefined;
    const fromBp = from ? asHideBreakpoint(resolveBreakpointAlias(from)) : undefined;

    const recipeClassName = hide({
      ...(belowBp && { below: belowBp }),
      ...(fromBp && { from: fromBp }),
      asContents,
    });

    return (
      <Component
        ref={ref}
        {...props}
        style={style}
        className={mergeClassName(recipeClassName, className)}
      >
        {children}
      </Component>
    );
  },
);

Hide.displayName = 'Hide';

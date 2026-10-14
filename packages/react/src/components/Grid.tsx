import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { css } from '@becket-ui/tokens/css';

import { normalizeGapValue, normalizeResponsiveValue, type GapValue, type ResponsiveValue } from '../helpers/responsive';

type Columns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type Span = Columns | 'full';

export type GridProps = ComponentPropsWithoutRef<'div'> & {
  /** Column count, 1–12, or per breakpoint: { base: 1, md: 12 }. */
  columns?: ResponsiveValue<Columns>;
  gap?: GapValue;
  as?: ElementType;
};

export type GridItemProps = ComponentPropsWithoutRef<'div'> & {
  /** Columns to span, 1–12 or "full", or per breakpoint: { base: 'full', md: 6 }. */
  colSpan?: ResponsiveValue<Span>;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Map a value or a breakpoint object through fn. The prebuilt CSS ships every
// 1–12 count and span at every breakpoint (panda.config staticCss), so these
// classes exist in apps that don't run Panda.
function mapResponsive<T, R>(value: ResponsiveValue<T> | undefined, fn: (item: T) => R) {
  const resolved = normalizeResponsiveValue(value as never) as unknown;
  if (resolved == null) return undefined;
  if (Array.isArray(resolved)) return resolved.map((item) => (item == null ? undefined : fn(item as T)));
  if (typeof resolved === 'object') {
    return Object.fromEntries(
      Object.entries(resolved as Record<string, T>).map(([breakpoint, item]) => [breakpoint, fn(item)]),
    );
  }
  return fn(resolved as T);
}

const toTemplate = (count: Columns) => `repeat(${count}, minmax(0, 1fr))`;
const toSpan = (span: Span) => (span === 'full' ? '1 / -1' : `span ${span} / span ${span}`);

/** 12-column layout grid. For equal tiles, SimpleGrid is simpler. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 12, gap = 'md', as: Component = 'div', className, ...props }, ref) => (
    <Component
      ref={ref}
      {...props}
      className={mergeClassName(
        css({
          display: 'grid',
          gridTemplateColumns: mapResponsive(columns, toTemplate) as never,
          gap: normalizeGapValue(gap) as never,
        }),
        className,
      )}
    />
  ),
);

Grid.displayName = 'Grid';

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ colSpan, as: Component = 'div', className, ...props }, ref) => (
    <Component
      ref={ref}
      {...props}
      className={mergeClassName(
        css({ minWidth: '0', ...(colSpan != null && { gridColumn: mapResponsive(colSpan, toSpan) as never }) }),
        className,
      )}
    />
  ),
);

GridItem.displayName = 'GridItem';

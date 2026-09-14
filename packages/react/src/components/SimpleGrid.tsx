import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { css } from '@becket-ui/tokens/css';
import { grid } from '@becket-ui/tokens/patterns';
import type { SystemStyleObject } from '@becket-ui/tokens/types';

import { normalizeGapValue, normalizeResponsiveValue, type GapValue, type ResponsiveValue } from '../helpers/responsive';

type GridOptions = NonNullable<Parameters<typeof grid>[0]>;
type ColumnCount = NonNullable<GridOptions['columns']>;

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function columnCountToTemplate(count: number): string {
  return `repeat(${count}, minmax(0, 1fr))`;
}

function resolveGridTemplateColumns(columns: ColumnCount): SystemStyleObject['gridTemplateColumns'] {
  const resolved = normalizeResponsiveValue(columns) as ColumnCount;
  if (typeof resolved === 'number') {
    return columnCountToTemplate(resolved);
  }
  if (Array.isArray(resolved)) {
    return resolved.map((value) => (value == null ? undefined : columnCountToTemplate(value)));
  }
  if (typeof resolved === 'object' && resolved !== null) {
    const out: Record<string, string> = {};
    for (const [breakpoint, value] of Object.entries(resolved)) {
      if (typeof value === 'number') out[breakpoint] = columnCountToTemplate(value);
    }
    return out;
  }
  return undefined;
}

function buildGridStyles({
  columns,
  minChildWidth,
  gap = 'md',
  rowGap,
  columnGap,
}: {
  columns?: GridOptions['columns'];
  minChildWidth?: GridOptions['minChildWidth'];
  gap?: GridOptions['gap'];
  rowGap?: GridOptions['rowGap'];
  columnGap?: GridOptions['columnGap'];
}): SystemStyleObject {
  if (columns != null) {
    return {
      display: 'grid',
      gridTemplateColumns: resolveGridTemplateColumns(columns),
      gap,
      ...(rowGap != null && { rowGap }),
      ...(columnGap != null && { columnGap }),
    };
  }

  return grid.raw({
    ...(minChildWidth != null && { minChildWidth }),
    gap,
    ...(rowGap != null && { rowGap }),
    ...(columnGap != null && { columnGap }),
  });
}

export type SimpleGridProps = ComponentPropsWithoutRef<'div'> & {
  columns?: ResponsiveValue<number> | GridOptions['columns'];
  minChildWidth?: GridOptions['minChildWidth'];
  gap?: GapValue;
  rowGap?: GapValue;
  columnGap?: GapValue;
  as?: ElementType;
};

/**
 * Responsive CSS grid layout. Pass `columns` (number or breakpoint object)
 * or `minChildWidth` for auto-fit tracks. App-specific presets belong in consumers.
 */
export const SimpleGrid = forwardRef<HTMLDivElement, SimpleGridProps>(
  (
    {
      columns,
      minChildWidth,
      gap = 'md',
      rowGap,
      columnGap,
      as: Component = 'div',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const recipeClassName = css(
      buildGridStyles({
        columns,
        minChildWidth,
        gap: normalizeGapValue(gap) as GridOptions['gap'],
        rowGap: normalizeGapValue(rowGap) as GridOptions['rowGap'],
        columnGap: normalizeGapValue(columnGap) as GridOptions['columnGap'],
      }),
      {
        width: '100%',
        justifyItems: 'stretch',
        alignItems: 'stretch',
        '& > *': {
          minWidth: '0',
          width: '100%',
          maxWidth: '100%',
        },
      },
    );

    return (
      <Component
        ref={ref}
        {...props}
        style={style}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
);

SimpleGrid.displayName = 'SimpleGrid';

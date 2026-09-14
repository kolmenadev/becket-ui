'use client';

import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef } from 'react';
import { table as tableRecipe } from '@becket-ui/tokens/recipes';

type TableSize = 'sm' | 'md';

const TableContext = createContext<TableSize>('md');

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type TableProps = ComponentPropsWithoutRef<'table'> & {
  size?: TableSize;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const styles = tableRecipe({ size });
    return (
      <TableContext.Provider value={size}>
        <table ref={ref} {...props} className={mergeClassName(styles.root, className)} />
      </TableContext.Provider>
    );
  },
);

Table.displayName = 'Table';

function useTableSize() {
  return useContext(TableContext);
}

export const TableCaption = forwardRef<HTMLTableCaptionElement, ComponentPropsWithoutRef<'caption'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <caption ref={ref} {...props} className={mergeClassName(styles.caption, className)} />;
  },
);
TableCaption.displayName = 'TableCaption';

export const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <thead ref={ref} {...props} className={mergeClassName(styles.thead, className)} />;
  },
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <tbody ref={ref} {...props} className={mergeClassName(styles.tbody, className)} />;
  },
);
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tfoot'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <tfoot ref={ref} {...props} className={mergeClassName(styles.tfoot, className)} />;
  },
);
TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <tr ref={ref} {...props} className={mergeClassName(styles.tr, className)} />;
  },
);
TableRow.displayName = 'TableRow';

export const TableColumnHeader = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'th'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <th ref={ref} {...props} className={mergeClassName(styles.th, className)} />;
  },
);
TableColumnHeader.displayName = 'TableColumnHeader';

export const TableCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'td'>>(
  ({ className, ...props }, ref) => {
    const styles = tableRecipe({ size: useTableSize() });
    return <td ref={ref} {...props} className={mergeClassName(styles.td, className)} />;
  },
);
TableCell.displayName = 'TableCell';

export const Thead = TableHeader;
export const Tbody = TableBody;
export const Tfoot = TableFooter;
export const Tr = TableRow;
export const Th = TableColumnHeader;
export const Td = TableCell;

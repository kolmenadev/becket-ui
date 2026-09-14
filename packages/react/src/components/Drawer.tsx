'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  type ComponentPropsWithoutRef,
  type DialogHTMLAttributes,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { drawer as drawerRecipe } from '@becket-ui/tokens/recipes';
import { assignRef, useNativeDialog } from '../helpers/nativeDialog';

type DrawerPlacement = 'start' | 'end';

type DrawerContextValue = {
  setOpen: (open: boolean) => void;
  titleId: string;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error('Drawer parts must be used within Drawer');
  }
  return ctx;
}

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type DrawerProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
  children?: ReactNode;
};

export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(
  (
    {
      open,
      defaultOpen = false,
      onOpenChange,
      placement = 'end',
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const { setOpen, titleId } = useNativeDialog(innerRef, { open, defaultOpen, onOpenChange });
    const styles = drawerRecipe({ placement });

    return (
      <DrawerContext.Provider value={{ setOpen, titleId }}>
        <dialog
          ref={(node) => {
            innerRef.current = node;
            assignRef(ref, node);
          }}
          className={mergeClassName(styles.root, className)}
          aria-labelledby={titleId}
          {...props}
          onClick={(event: MouseEvent<HTMLDialogElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            if (event.target === event.currentTarget) setOpen(false);
          }}
          onClose={() => setOpen(false)}
        >
          {children}
        </dialog>
      </DrawerContext.Provider>
    );
  },
);

Drawer.displayName = 'Drawer';

export const DrawerHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = drawerRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.header, className)} />;
  },
);
DrawerHeader.displayName = 'DrawerHeader';

type DrawerTitleProps = ComponentPropsWithoutRef<'h2'> & { as?: ElementType };

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ className, as: Comp = 'h2', ...props }, ref) => {
    const { titleId } = useDrawer();
    const styles = drawerRecipe();
    return (
      <Comp ref={ref} id={titleId} {...props} className={mergeClassName(styles.title, className)} />
    );
  },
);
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = drawerRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.body, className)} />;
  },
);
DrawerBody.displayName = 'DrawerBody';

export const DrawerFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = drawerRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.footer, className)} />;
  },
);
DrawerFooter.displayName = 'DrawerFooter';

export const DrawerClose = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  ({ className, children = '×', type = 'button', onClick, ...props }, ref) => {
    const { setOpen } = useDrawer();
    const styles = drawerRecipe();
    return (
      <button
        ref={ref}
        type={type}
        aria-label={props['aria-label'] ?? 'Close'}
        {...props}
        className={mergeClassName(styles.close, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(false);
        }}
      >
        {children}
      </button>
    );
  },
);
DrawerClose.displayName = 'DrawerClose';

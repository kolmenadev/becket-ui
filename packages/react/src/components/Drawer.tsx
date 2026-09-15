'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
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
type DrawerRole = 'dialog' | 'alertdialog';

type DrawerContextValue = {
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
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

export type DrawerProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DrawerPlacement;
  /** Composed heading. When set, Drawer renders header + close. */
  title?: ReactNode;
  /** Composed actions (pass `Button` nodes). When set, Drawer renders the footer. */
  footer?: ReactNode;
  /** Same as Dialog: `alertdialog` disables backdrop dismiss. */
  role?: DrawerRole;
  children?: ReactNode;
};

export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(
  (
    {
      open,
      defaultOpen = false,
      onOpenChange,
      placement = 'end',
      title,
      footer,
      role = 'dialog',
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const { setOpen, titleId, descriptionId, labelledBy, describedBy, registerTitle, registerDescription } =
      useNativeDialog(innerRef, {
        open,
        defaultOpen,
        onOpenChange,
        titlePresent: title != null,
        descriptionPresent: children != null && children !== false,
      });
    const styles = drawerRecipe({ placement });
    const composeChrome = title != null || footer != null;
    const lightDismiss = role !== 'alertdialog';

    return (
      <DrawerContext.Provider
        value={{ setOpen, titleId, descriptionId, registerTitle, registerDescription }}
      >
        <dialog
          ref={(node) => {
            innerRef.current = node;
            assignRef(ref, node);
          }}
          role={role}
          tabIndex={-1}
          className={mergeClassName(styles.root, className)}
          {...props}
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          onClick={(event: MouseEvent<HTMLDialogElement>) => {
            onClick?.(event);
            if (event.defaultPrevented || !lightDismiss) return;
            if (event.target === event.currentTarget) setOpen(false);
          }}
          onClose={() => setOpen(false)}
        >
          {composeChrome ? (
            <>
              {title != null && (
                <DrawerHeader>
                  <DrawerTitle>{title}</DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
              )}
              <DrawerBody>{children}</DrawerBody>
              {footer != null && <DrawerFooter>{footer}</DrawerFooter>}
            </>
          ) : (
            children
          )}
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
    const { titleId, registerTitle } = useDrawer();
    const styles = drawerRecipe();
    useLayoutEffect(() => {
      registerTitle(true);
      return () => registerTitle(false);
    }, [registerTitle]);
    return (
      <Comp ref={ref} id={titleId} {...props} className={mergeClassName(styles.title, className)} />
    );
  },
);
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { descriptionId, registerDescription } = useDrawer();
    const styles = drawerRecipe();
    const hasContent = children != null && children !== false;
    useLayoutEffect(() => {
      registerDescription(hasContent);
      return () => registerDescription(false);
    }, [hasContent, registerDescription]);
    return (
      <div
        ref={ref}
        id={descriptionId}
        {...props}
        className={mergeClassName(styles.body, className)}
      >
        {children}
      </div>
    );
  },
);
DrawerBody.displayName = 'DrawerBody';

export const DrawerFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = drawerRecipe();
    return (
      <div
        ref={ref}
        data-becket-dialog-footer=""
        {...props}
        className={mergeClassName(styles.footer, className)}
      />
    );
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
        data-becket-dialog-close=""
        {...props}
        aria-label={props['aria-label'] ?? 'Close'}
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

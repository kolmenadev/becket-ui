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
import { dialog as dialogRecipe } from '@becket-ui/tokens/recipes';
import { assignRef, useNativeDialog } from '../helpers/nativeDialog';

type DialogRole = 'dialog' | 'alertdialog';

type DialogContextValue = {
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog parts must be used within Dialog');
  }
  return ctx;
}

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Composed heading. When set, Dialog renders header + close. */
  title?: ReactNode;
  /** Composed actions (pass `Button` nodes). When set, Dialog renders the footer. */
  footer?: ReactNode;
  /**
   * `alertdialog` is for confirms: no backdrop dismiss, Escape still closes,
   * initial focus is the first footer action (Cancel) when present.
   */
  role?: DialogRole;
  children?: ReactNode;
};

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  (
    {
      open,
      defaultOpen = false,
      onOpenChange,
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
    const styles = dialogRecipe();
    const composeChrome = title != null || footer != null;
    const lightDismiss = role !== 'alertdialog';

    return (
      <DialogContext.Provider
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
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogClose />
                </DialogHeader>
              )}
              <DialogBody>{children}</DialogBody>
              {footer != null && <DialogFooter>{footer}</DialogFooter>}
            </>
          ) : (
            children
          )}
        </dialog>
      </DialogContext.Provider>
    );
  },
);

Dialog.displayName = 'Dialog';

export const DialogHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = dialogRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.header, className)} />;
  },
);
DialogHeader.displayName = 'DialogHeader';

type DialogTitleProps = ComponentPropsWithoutRef<'h2'> & { as?: ElementType };

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, as: Comp = 'h2', ...props }, ref) => {
    const { titleId, registerTitle } = useDialog();
    const styles = dialogRecipe();
    useLayoutEffect(() => {
      registerTitle(true);
      return () => registerTitle(false);
    }, [registerTitle]);
    return (
      <Comp ref={ref} id={titleId} {...props} className={mergeClassName(styles.title, className)} />
    );
  },
);
DialogTitle.displayName = 'DialogTitle';

export const DialogBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { descriptionId, registerDescription } = useDialog();
    const styles = dialogRecipe();
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
DialogBody.displayName = 'DialogBody';

export const DialogFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = dialogRecipe();
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
DialogFooter.displayName = 'DialogFooter';

type DialogCloseProps = ComponentPropsWithoutRef<'button'>;

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children = '×', type = 'button', onClick, ...props }, ref) => {
    const { setOpen } = useDialog();
    const styles = dialogRecipe();
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
DialogClose.displayName = 'DialogClose';

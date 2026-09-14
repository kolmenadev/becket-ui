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
import { dialog as dialogRecipe } from '@becket-ui/tokens/recipes';
import { assignRef, useNativeDialog } from '../helpers/nativeDialog';

type DialogContextValue = {
  setOpen: (open: boolean) => void;
  titleId: string;
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

export type DialogProps = Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open'> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, defaultOpen = false, onOpenChange, className, children, onClick, ...props }, ref) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const { setOpen, titleId } = useNativeDialog(innerRef, { open, defaultOpen, onOpenChange });
    const styles = dialogRecipe();

    return (
      <DialogContext.Provider value={{ setOpen, titleId }}>
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
    const { titleId } = useDialog();
    const styles = dialogRecipe();
    return (
      <Comp ref={ref} id={titleId} {...props} className={mergeClassName(styles.title, className)} />
    );
  },
);
DialogTitle.displayName = 'DialogTitle';

export const DialogBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = dialogRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.body, className)} />;
  },
);
DialogBody.displayName = 'DialogBody';

export const DialogFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = dialogRecipe();
    return <div ref={ref} {...props} className={mergeClassName(styles.footer, className)} />;
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
DialogClose.displayName = 'DialogClose';

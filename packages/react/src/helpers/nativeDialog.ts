import {
  useCallback,
  useEffect,
  useId,
  useState,
  type MutableRefObject,
  type Ref,
  type RefObject,
} from 'react';

type NativeDialogOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Composed title is in the tree (skip waiting on DialogTitle mount). */
  titlePresent?: boolean;
  /** Composed body has content (skip waiting on DialogBody mount). */
  descriptionPresent?: boolean;
};

export function useNativeDialog(
  dialogRef: RefObject<HTMLDialogElement | null>,
  {
    open,
    defaultOpen = false,
    onOpenChange,
    titlePresent = false,
    descriptionPresent = false,
  }: NativeDialogOptions,
) {
  const isControlled = open !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = isControlled ? Boolean(open) : uncontrolled;
  const titleId = useId();
  const descriptionId = useId();
  const [slots, setSlots] = useState({ title: false, description: false });

  const registerTitle = useCallback((present: boolean) => {
    setSlots((prev) => (prev.title === present ? prev : { ...prev, title: present }));
  }, []);

  const registerDescription = useCallback((present: boolean) => {
    setSlots((prev) => (prev.description === present ? prev : { ...prev, description: present }));
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (!isOpen) {
      if (el.open) el.close();
      return;
    }

    if (!el.open) {
      if (typeof el.showModal === 'function') {
        el.showModal();
      } else {
        el.setAttribute('open', '');
      }
    }

    const focusInitial = () => {
      if (!el.open && !el.hasAttribute('open')) return;
      const marked = el.querySelector<HTMLElement>('[data-becket-initial-focus]');
      const footerBtn = el.querySelector<HTMLElement>('[data-becket-dialog-footer] button:not([disabled])');
      const target = marked ?? footerBtn ?? el;
      target.focus();
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(focusInitial);
    });
    return () => cancelAnimationFrame(frame);
  }, [dialogRef, isOpen]);

  const labelledBy = titlePresent || slots.title ? titleId : undefined;
  const describedBy = descriptionPresent || slots.description ? descriptionId : undefined;

  return {
    isOpen,
    setOpen,
    titleId,
    descriptionId,
    labelledBy,
    describedBy,
    registerTitle,
    registerDescription,
  };
}

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

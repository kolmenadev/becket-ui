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
};

export function useNativeDialog(
  dialogRef: RefObject<HTMLDialogElement | null>,
  { open, defaultOpen = false, onOpenChange }: NativeDialogOptions,
) {
  const isControlled = open !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = isControlled ? Boolean(open) : uncontrolled;
  const titleId = useId();

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
    if (isOpen) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [dialogRef, isOpen]);

  return { isOpen, setOpen, titleId };
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

'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ComponentPropsWithoutRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { field, selectRecipe, textFieldRecipe, textareaRecipe } from '@becket-ui/tokens/recipes';

export type FieldSize = 'sm' | 'md' | 'lg';

export type FieldContextValue = {
  id: string;
  invalid: boolean;
  size: FieldSize;
  helperId: string;
  errorId: string;
  describedBy?: string;
};

type DescribedBySlot = 'helper' | 'error';

type FieldContextInternal = FieldContextValue & {
  registerDescribedBy: (slot: DescribedBySlot, present: boolean) => void;
};

const FieldContext = createContext<FieldContextInternal | null>(null);

function toPublicField(ctx: FieldContextInternal): FieldContextValue {
  const { registerDescribedBy: _register, ...publicCtx } = ctx;
  return publicCtx;
}

export function useField(): FieldContextValue {
  const ctx = useOptionalFieldInternal();
  if (!ctx) {
    throw new Error('useField must be used within Field');
  }
  return toPublicField(ctx);
}

function useOptionalFieldInternal(): FieldContextInternal | null {
  return useContext(FieldContext);
}

export function useOptionalField(): FieldContextValue | null {
  const ctx = useOptionalFieldInternal();
  return ctx ? toPublicField(ctx) : null;
}

function useFieldInternal(): FieldContextInternal {
  const ctx = useOptionalFieldInternal();
  if (!ctx) {
    throw new Error('useField must be used within Field');
  }
  return ctx;
}

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type FieldProps = ComponentPropsWithoutRef<'div'> & {
  size?: FieldSize;
  invalid?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
};

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      size = 'md',
      invalid = false,
      fullWidth = false,
      id: idProp,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const [slots, setSlots] = useState({ helper: false, error: false });
    const registerDescribedBy = useCallback((slot: DescribedBySlot, present: boolean) => {
      setSlots((prev) => (prev[slot] === present ? prev : { ...prev, [slot]: present }));
    }, []);
    const describedBy =
      invalid && slots.error ? errorId : slots.helper ? helperId : undefined;
    const styles = field({ size, fullWidth });

    return (
      <FieldContext.Provider
        value={{ id, invalid, size, helperId, errorId, describedBy, registerDescribedBy }}
      >
        <div ref={ref} {...props} className={mergeClassName(styles.root, className)}>
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);

Field.displayName = 'Field';

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => {
    const { id, size } = useField();
    const styles = field({ size });
    return (
      <label ref={ref} htmlFor={id} {...props} className={mergeClassName(styles.label, className)} />
    );
  },
);

FieldLabel.displayName = 'FieldLabel';

type FieldHelperProps = ComponentPropsWithoutRef<'span'>;

export const FieldHelper = forwardRef<HTMLSpanElement, FieldHelperProps>(
  ({ className, ...props }, ref) => {
    const { size, helperId, registerDescribedBy } = useFieldInternal();
    const styles = field({ size });
    useLayoutEffect(() => {
      registerDescribedBy('helper', true);
      return () => registerDescribedBy('helper', false);
    }, [registerDescribedBy]);
    return (
      <span
        ref={ref}
        id={helperId}
        {...props}
        className={mergeClassName(styles.helper, className)}
      />
    );
  },
);

FieldHelper.displayName = 'FieldHelper';

export const FieldError = forwardRef<HTMLSpanElement, FieldHelperProps>(
  ({ className, ...props }, ref) => {
    const { size, errorId, registerDescribedBy } = useFieldInternal();
    const styles = field({ size });
    useLayoutEffect(() => {
      registerDescribedBy('error', true);
      return () => registerDescribedBy('error', false);
    }, [registerDescribedBy]);
    return (
      <span
        ref={ref}
        id={errorId}
        role="alert"
        {...props}
        className={mergeClassName(styles.error, className)}
      />
    );
  },
);

FieldError.displayName = 'FieldError';

type FieldControlProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

/** Native text input wired to the parent Field (id, aria, size, invalid). */
export const FieldControl = forwardRef<HTMLInputElement, FieldControlProps>(
  ({ className, ...props }, ref) => {
    const { id, invalid, size, describedBy } = useField();
    const controlClass = textFieldRecipe({ size, invalid });
    return (
      <input
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
        className={mergeClassName(controlClass, className)}
      />
    );
  },
);

FieldControl.displayName = 'FieldControl';

type FieldSelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'size'>;

export const FieldSelect = forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ className, ...props }, ref) => {
    const { id, invalid, size, describedBy } = useField();
    const controlClass = selectRecipe({ size, invalid });
    return (
      <select
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
        className={mergeClassName(controlClass, className)}
      />
    );
  },
);

FieldSelect.displayName = 'FieldSelect';

type FieldTextareaProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'size'>;

export const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(
  ({ className, ...props }, ref) => {
    const { id, invalid, size, describedBy } = useField();
    const controlClass = textareaRecipe({ size, invalid });
    return (
      <textarea
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
        className={mergeClassName(controlClass, className)}
      />
    );
  },
);

FieldTextarea.displayName = 'FieldTextarea';

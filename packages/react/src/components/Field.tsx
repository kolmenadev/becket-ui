'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { field, selectRecipe, textFieldRecipe, textareaRecipe } from '@becket-ui/tokens/recipes';

import { WarningIcon } from './Glyphs';

// The component tsconfig does not load @types/node, and tsc fails on a bare process name
// (seen on MAV-190).
declare const process: { env: { NODE_ENV?: string } };

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
    const hasWarnedRef = useRef(false);
    const styles = field({ size, fullWidth });

    // Reads the committed DOM, not `slots`: FieldHelper and FieldError register in layout effects,
    // and React runs this effect from the first render, with no slots yet, before re-rendering.
    // style-check keep: syncs with the committed DOM after mount to warn; not derived state.
    useEffect(() => {
      if (hasWarnedRef.current || !invalid) return;
      // Read inside try rather than behind typeof process: bundlers replace process.env.NODE_ENV
      // but don't define process, and unbundled ESM in a browser has no process at all.
      try {
        if (process.env.NODE_ENV === 'production') return;
      } catch {
        return;
      }
      if (document.getElementById(errorId) || document.getElementById(helperId)) return;
      hasWarnedRef.current = true;
      console.warn(
        'Becket UI: invalid field has no error message. Pass `errorText` (or `helperText`), or ' +
          'render a FieldError, so the error is not shown by color alone.',
      );
    }, [invalid, errorId, helperId]);

    return (
      <FieldContext.Provider
        value={{
          id,
          invalid,
          size,
          helperId,
          errorId,
          // Error first: a screen reader reads what to fix before the hint.
          describedBy:
            [invalid && slots.error && errorId, slots.helper && helperId]
              .filter(Boolean)
              .join(' ') || undefined,
          registerDescribedBy,
        }}
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
  ({ className, children, dangerouslySetInnerHTML, ...props }, ref) => {
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
      >
        {/* The shape marks the error without color (WCAG 1.4.1). Icon's smallest step is used at
            every size: the field recipe can't resize it, because Icon's size variant sits in a
            later cascade layer than slot recipes. */}
        <WarningIcon size="sm" />
        {/* One flex item for the message, so inline markup inside it keeps its spacing. Raw HTML
            goes here too: on the outer span it would replace the glyph, and React throws. */}
        <span dangerouslySetInnerHTML={dangerouslySetInnerHTML}>{children}</span>
      </span>
    );
  },
);

FieldError.displayName = 'FieldError';

// Internal: TextField, Select and Textarea share it; the package index doesn't export it.
export function FieldMessages({
  helperText,
  errorText,
}: {
  helperText?: ReactNode;
  errorText?: ReactNode;
}) {
  const { invalid } = useField();
  // false, true and '' render nothing (a `condition && 'message'` value), so they count as no
  // errorText; 0 still renders.
  const errorMessage =
    errorText == null || typeof errorText === 'boolean' || errorText === '' ? undefined : errorText;
  return (
    <>
      {helperText != null && (!invalid || errorMessage != null) ? (
        <FieldHelper>{helperText}</FieldHelper>
      ) : null}
      {/* An invalid field without errorText shows helperText as the error, so fields written
          before errorText keep working. */}
      {invalid && (errorMessage ?? helperText) != null ? (
        <FieldError>{errorMessage ?? helperText}</FieldError>
      ) : null}
    </>
  );
}

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

'use client';

import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import {
  Field,
  FieldError,
  FieldHelper,
  FieldLabel,
  FieldTextarea,
  type FieldSize,
} from './Field';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  label?: ReactNode;
  /** Hint under the control. When `invalid` and no `errorText`, it is shown as the error. */
  helperText?: ReactNode;
  /** Error message shown with the warning glyph when `invalid`; `helperText` then stays as the hint. */
  errorText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  fullWidth?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      size = 'md',
      invalid = false,
      fullWidth = false,
      id,
      rows,
      ...props
    },
    ref,
  ) => {
    const rowCount = rows ?? (size === 'sm' ? 2 : size === 'lg' ? 6 : 4);
    return (
      <Field id={id} size={size} invalid={invalid} fullWidth={fullWidth}>
        {label != null ? <FieldLabel>{label}</FieldLabel> : null}
        <FieldTextarea ref={ref} rows={rowCount} {...props} />
        {helperText != null && (!invalid || errorText != null) ? (
          <FieldHelper>{helperText}</FieldHelper>
        ) : null}
        {/* An invalid field without errorText shows helperText as the error, so fields written
            before errorText keep working. */}
        {invalid && (errorText ?? helperText) != null ? (
          <FieldError>{errorText ?? helperText}</FieldError>
        ) : null}
      </Field>
    );
  },
);

Textarea.displayName = 'Textarea';

'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  Field,
  FieldControl,
  FieldError,
  FieldHelper,
  FieldLabel,
  type FieldSize,
} from './Field';

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode;
  /** Hint under the control. When `invalid` and no `errorText`, it is shown as the error. */
  helperText?: ReactNode;
  /** Error message shown with the warning glyph when `invalid`; `helperText` then stays as the hint. */
  errorText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  /** Stretch to the parent width. Default is token `sizes.field` (12.5rem). */
  fullWidth?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorText,
      size = 'md',
      invalid = false,
      fullWidth = false,
      id,
      ...props
    },
    ref,
  ) => {
    return (
      <Field id={id} size={size} invalid={invalid} fullWidth={fullWidth}>
        {label != null ? <FieldLabel>{label}</FieldLabel> : null}
        <FieldControl ref={ref} {...props} />
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

TextField.displayName = 'TextField';

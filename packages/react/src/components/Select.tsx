'use client';

import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import {
  Field,
  FieldError,
  FieldHelper,
  FieldLabel,
  FieldSelect,
  type FieldSize,
} from './Field';

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?: ReactNode;
  /** Hint under the control. When `invalid` and no `errorText`, it is shown as the error. */
  helperText?: ReactNode;
  /** Error message shown with the warning glyph when `invalid`; `helperText` then stays as the hint. */
  errorText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  fullWidth?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      size = 'md',
      invalid = false,
      fullWidth = false,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Field id={id} size={size} invalid={invalid} fullWidth={fullWidth}>
        {label != null ? <FieldLabel>{label}</FieldLabel> : null}
        <FieldSelect ref={ref} {...props}>
          {children}
        </FieldSelect>
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

Select.displayName = 'Select';

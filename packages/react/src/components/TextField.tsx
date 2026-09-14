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
  helperText?: ReactNode;
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
        {helperText != null ? (
          invalid ? (
            <FieldError>{helperText}</FieldError>
          ) : (
            <FieldHelper>{helperText}</FieldHelper>
          )
        ) : null}
      </Field>
    );
  },
);

TextField.displayName = 'TextField';

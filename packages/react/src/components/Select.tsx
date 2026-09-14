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
  helperText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  fullWidth?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
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

Select.displayName = 'Select';

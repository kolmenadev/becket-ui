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
  helperText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  fullWidth?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
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

Textarea.displayName = 'Textarea';

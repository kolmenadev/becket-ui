'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { radio as radioRecipe } from '@becket-ui/tokens/recipes';
import { useOptionalField } from './Field';

type RadioSize = 'sm' | 'md';

type RadioGroupContextValue = {
  name: string;
  value?: string;
  defaultValue?: string;
  disabled: boolean;
  invalid: boolean;
  size: RadioSize;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function fieldRadioSize(size?: 'sm' | 'md' | 'lg'): RadioSize | undefined {
  if (size == null) return undefined;
  return size === 'lg' ? 'md' : size;
}

export type RadioGroupProps = Omit<ComponentPropsWithoutRef<'fieldset'>, 'onChange'> & {
  name?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: RadioSize;
  legend?: ReactNode;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
};

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name: nameProp,
      value,
      defaultValue,
      disabled = false,
      invalid: invalidProp,
      size: sizeProp,
      legend,
      onValueChange,
      className,
      children,
      'aria-describedby': describedByProp,
      ...props
    },
    ref,
  ) => {
    const autoName = useId();
    const field = useOptionalField();
    const name = nameProp ?? autoName;
    const invalid = invalidProp ?? field?.invalid ?? false;
    const size = sizeProp ?? fieldRadioSize(field?.size) ?? 'md';
    const describedBy = describedByProp ?? field?.describedBy;
    const styles = radioRecipe({ size });

    const ctx = useMemo(
      () => ({
        name,
        value,
        defaultValue,
        disabled,
        invalid,
        size,
        onValueChange,
      }),
      [defaultValue, disabled, invalid, name, onValueChange, size, value],
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        <fieldset
          ref={ref}
          {...props}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={mergeClassName(styles.group, className)}
        >
          {legend != null ? <legend className={styles.legend}>{legend}</legend> : null}
          {children}
        </fieldset>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  size?: RadioSize;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      id,
      name: nameProp,
      value,
      label,
      description,
      disabled: disabledProp,
      className,
      size: sizeProp,
      checked: checkedProp,
      defaultChecked: defaultCheckedProp,
      onChange,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const group = useContext(RadioGroupContext);
    const inputId = id ?? autoId;
    const descriptionId = description != null ? `${inputId}-desc` : undefined;
    const name = group?.name ?? nameProp;
    const disabled = Boolean(disabledProp || group?.disabled);
    const invalid = group?.invalid;
    const size = sizeProp ?? group?.size ?? 'md';
    const groupControlled = group != null && group.value !== undefined;
    const checked = groupControlled ? group.value === value : checkedProp;
    const defaultChecked = groupControlled
      ? undefined
      : group?.defaultValue != null
        ? group.defaultValue === value
        : defaultCheckedProp;
    const styles = radioRecipe({ size });

    return (
      <label
        className={mergeClassName(styles.root, className)}
        htmlFor={inputId}
        data-disabled={disabled ? '' : undefined}
      >
        <input
          ref={ref}
          id={inputId}
          type="radio"
          name={name}
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={descriptionId}
          {...props}
          {...(checked !== undefined ? { checked } : {})}
          {...(checked === undefined && defaultChecked !== undefined ? { defaultChecked } : {})}
          className={styles.control}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
            if (event.target.checked) {
              group?.onValueChange?.(event.target.value);
            }
          }}
        />
        <span className={styles.indicator} aria-hidden="true" />
        {label != null || description != null ? (
          <span className={styles.text}>
            {label != null ? <span className={styles.label}>{label}</span> : null}
            {description != null ? (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);

Radio.displayName = 'Radio';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { checkbox as checkboxRecipe } from '@becket-ui/tokens/recipes';

type CheckboxSize = 'sm' | 'md';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  label?: ReactNode;
  description?: ReactNode;
  size?: CheckboxSize;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, description, disabled, className, size = 'md', ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const descriptionId = description != null ? `${inputId}-desc` : undefined;
    const styles = checkboxRecipe({ size });

    return (
      <label
        className={mergeClassName(styles.root, className)}
        htmlFor={inputId}
        data-disabled={disabled ? '' : undefined}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-describedby={descriptionId}
          {...props}
          className={styles.control}
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

Checkbox.displayName = 'Checkbox';

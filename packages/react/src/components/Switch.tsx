'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { switchRecipe } from '@becket-ui/tokens/recipes';

type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = 'md',
      disabled = false,
      className,
      id: idProp,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const isControlled = checkedProp !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultChecked);
    const checked = isControlled ? Boolean(checkedProp) : uncontrolled;

    const setChecked = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolled(next);
        onCheckedChange?.(next);
      },
      [isControlled, onCheckedChange],
    );

    const toggle = () => {
      if (disabled) return;
      setChecked(!checked);
    };

    const styles = switchRecipe({ size, checked });

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={mergeClassName(styles.root, className)}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            toggle();
          }
        }}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </button>
    );
  },
);

Switch.displayName = 'Switch';

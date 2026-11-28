import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { alert as alertRecipe } from '@becket-ui/tokens/recipes';

import { CheckIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from './Glyphs';

export type AlertStatus = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = Omit<ComponentPropsWithoutRef<'div'>, 'title' | 'role'> & {
  /** Default `info`. Shown by an icon of its own shape and a border, never by color alone. */
  status?: AlertStatus;
  title?: ReactNode;
  /** Buttons or links under the message, e.g. `<Button size="sm">Retry</Button>`. */
  actions?: ReactNode;
  /** When set, the alert shows a dismiss button that calls it. The alert doesn't hide itself. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  /** Names the icon for screen readers. Defaults: "Info", "Success", "Warning", "Error". */
  statusLabel?: string;
  /**
   * Default `status`: announced politely when the alert appears or changes. Use `alert` only for
   * urgent errors the user must act on now; it interrupts whatever is being read. `none` for a
   * notice that is part of the page and never changes.
   */
  role?: 'status' | 'alert' | 'none';
  as?: ElementType;
};

/** An inline notice: a status icon, an optional title, the message, actions and a dismiss button. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      status = 'info',
      title,
      actions,
      onDismiss,
      dismissLabel = 'Dismiss',
      statusLabel,
      role = 'status',
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const styles = alertRecipe({ status });
    // style-check keep: JSX can only render a component through a capitalized name.
    const Glyph = { info: InfoIcon, success: CheckIcon, warning: WarningIcon, danger: ErrorIcon }[
      status
    ];
    return (
      <Component
        ref={ref}
        role={role}
        data-status={status}
        {...props}
        className={[styles.root, className].filter(Boolean).join(' ')}
      >
        <Glyph
          className={styles.icon}
          label={
            statusLabel ??
            { info: 'Info', success: 'Success', warning: 'Warning', danger: 'Error' }[status]
          }
        />
        <div className={styles.content}>
          {title != null && <div className={styles.title}>{title}</div>}
          {children != null && <div className={styles.description}>{children}</div>}
          {actions != null && <div className={styles.actions}>{actions}</div>}
        </div>
        {onDismiss && (
          <button
            type="button"
            aria-label={dismissLabel}
            className={styles.dismiss}
            onClick={onDismiss}
          >
            <CloseIcon size="sm" />
          </button>
        )}
      </Component>
    );
  },
);

Alert.displayName = 'Alert';

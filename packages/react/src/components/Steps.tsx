import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { steps as stepsRecipe } from '@becket-ui/tokens/recipes';

import { CheckIcon } from './Glyphs';
import { VisuallyHidden } from './VisuallyHidden';

export type StepsProps = ComponentPropsWithoutRef<'ol'> & {
  /** Default `horizontal`. For narrow screens, pass `vertical`. */
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
};

/**
 * A display-only list of the steps in a process, and where the user is in it. Each `Step` sets its
 * own `status`; nothing here is clickable or keeps state. Renders without client JS.
 */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(
  ({ orientation = 'horizontal', size = 'md', className, ...props }, ref) => (
    <ol
      ref={ref}
      {...props}
      className={[stepsRecipe({ orientation, size }).root, className].filter(Boolean).join(' ')}
    />
  ),
);

Steps.displayName = 'Steps';

export type StepProps = Omit<ComponentPropsWithoutRef<'li'>, 'title'> & {
  status: 'complete' | 'current' | 'upcoming';
  title: ReactNode;
  description?: ReactNode;
  /**
   * Read after the title by screen readers. Defaults to "(completed)" and "(not started)"; the
   * current step has `aria-current="step"` and no text unless you pass one.
   */
  statusLabel?: string;
};

export const Step = forwardRef<HTMLLIElement, StepProps>(
  ({ status, title, description, statusLabel, className, ...props }, ref) => {
    const styles = stepsRecipe();
    return (
      <li
        ref={ref}
        aria-current={status === 'current' ? 'step' : undefined}
        data-status={status}
        {...props}
        className={[styles.step, className].filter(Boolean).join(' ')}
      >
        {/* The number comes from a CSS counter while the marker is empty. */}
        <span className={styles.marker} aria-hidden="true">
          {status === 'complete' && <CheckIcon />}
        </span>
        <span className={styles.content}>
          <span className={styles.title}>
            {title}
            {/* One label or none: the current step's default is no text (aria-current says it). */}
            {[
              statusLabel ??
                { complete: '(completed)', current: '', upcoming: '(not started)' }[status],
            ]
              .filter(Boolean)
              .map((label) => (
                <VisuallyHidden key={label}> {label}</VisuallyHidden>
              ))}
          </span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
      </li>
    );
  },
);

Step.displayName = 'Step';

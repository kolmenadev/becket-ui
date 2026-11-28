'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { toast as toastRecipe } from '@becket-ui/tokens/recipes';

import { Alert, type AlertStatus } from './Alert';

export type ToastOptions = {
  /** Default `info`. `danger` toasts are announced assertively and stay until dismissed. */
  status?: AlertStatus;
  title?: ReactNode;
  description?: ReactNode;
  /** One button or link, e.g. `<Button size="sm">Undo</Button>`. */
  action?: ReactNode;
  /**
   * Milliseconds before the toast closes itself; `null` keeps it until dismissed. Defaults to the
   * provider's `duration`, or `null` for `danger`. The countdown pauses while the pointer or focus
   * is on any toast.
   */
  duration?: number | null;
  /** Showing a toast with an id that is already on screen replaces it. */
  id?: string;
};

export type ToastAPI = {
  /** Shows a toast and returns its id. Never moves focus. */
  show: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
};

export type ToastProviderProps = {
  children?: ReactNode;
  /** Name of the notifications region landmark. Default "Notifications". */
  label?: string;
  /** Default auto-dismiss time in milliseconds. Default 5000. */
  duration?: number;
  /** Accessible name of each toast's dismiss button. Default "Dismiss notification". */
  dismissLabel?: string;
};

const ToastContext = createContext<ToastAPI | null>(null);

/** Shows toasts from `useToast()`. Render it once, around the app. */
export function ToastProvider({
  children,
  label = 'Notifications',
  duration = 5000,
  dismissLabel = 'Dismiss notification',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const count = useRef(0);
  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const show = useCallback((toast: ToastOptions) => {
    count.current += 1;
    const id = toast.id ?? `toast-${count.current}`;
    setToasts((current) => [...current.filter((each) => each.id !== id), { ...toast, id }]);
    return id;
  }, []);
  const styles = toastRecipe();

  return (
    <ToastContext.Provider value={useMemo(() => ({ show, dismiss }), [show, dismiss])}>
      {children}
      {/* Both lists are live regions from the first render: a region added together with its
          message isn't announced. Assertive and polite can't share one list, because a live
          region's politeness can't change per message. */}
      <section
        aria-label={label}
        className={styles.region}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setHasFocus(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
        }}
      >
        {/* as const: aria-live only takes these two literals. */}
        {(['assertive', 'polite'] as const).map((politeness) => (
          <ol key={politeness} aria-live={politeness} className={styles.list}>
            {toasts
              .filter((toast) => (toast.status === 'danger') === (politeness === 'assertive'))
              .map((toast) => (
                <li key={toast.id} className={styles.item}>
                  <ToastTimer
                    id={toast.id}
                    duration={
                      toast.duration !== undefined
                        ? toast.duration
                        : toast.status === 'danger'
                          ? null
                          : duration
                    }
                    isPaused={isHovered || hasFocus}
                    onExpire={dismiss}
                  />
                  <Alert
                    role="none"
                    status={toast.status}
                    title={toast.title}
                    actions={toast.action}
                    dismissLabel={dismissLabel}
                    onDismiss={() => dismiss(toast.id)}
                  >
                    {toast.description}
                  </Alert>
                </li>
              ))}
          </ol>
        ))}
      </section>
    </ToastContext.Provider>
  );
}

// style-check keep: each toast needs its own timer hook, and hooks can't run inside a loop.
function ToastTimer({
  id,
  duration,
  isPaused,
  onExpire,
}: {
  id: string;
  duration: number | null;
  isPaused: boolean;
  onExpire: (id: string) => void;
}) {
  const remaining = useRef(duration);
  // style-check keep: a timer is outside React; pausing keeps the time left for the next start.
  useEffect(() => {
    if (isPaused || remaining.current === null) return;
    // style-check keep: read when the countdown starts, used when it stops.
    const startedAt = Date.now();
    // style-check keep: the timeout id is kept from the start to the cleanup that clears it.
    const timer = setTimeout(() => onExpire(id), remaining.current);
    return () => {
      clearTimeout(timer);
      if (remaining.current !== null) remaining.current -= Date.now() - startedAt;
    };
  }, [id, isPaused, onExpire]);
  return null;
}

/** `show` and `dismiss` toasts from anywhere inside `ToastProvider`. */
export function useToast(): ToastAPI {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used within ToastProvider');
  return api;
}

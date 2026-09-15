'use client';

/**
 * Hover / focus tooltip (generic DS primitive).
 * Default placement top, open delay 200ms.
 */

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { tooltip as tooltipRecipe } from '@becket-ui/tokens/recipes';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export type TooltipProps = {
  /** Short glossary / hint text (or node). */
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  /** Delay before open on hover/focus (ms). */
  delayMs?: number;
  disabled?: boolean;
};

const OFFSET_PX = 8;

const NATIVE_FOCUSABLE = new Set(['a', 'button', 'input', 'select', 'summary', 'textarea']);

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  tabIndex?: number;
  href?: string;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  'aria-describedby'?: string;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

function chain<E>(their?: (event: E) => void, ours?: (event: E) => void) {
  return (event: E) => {
    their?.(event);
    ours?.(event);
  };
}

function triggerNeedsTabIndex(element: ReactElement<TriggerProps>): boolean {
  if (typeof element.type !== 'string') {
    return false;
  }
  if (NATIVE_FOCUSABLE.has(element.type)) {
    return false;
  }
  if (element.props.tabIndex != null) {
    return false;
  }
  return true;
}

function computePosition(
  trigger: DOMRect,
  tip: DOMRect,
  placement: TooltipPlacement,
): { top: number; left: number } {
  const cx = trigger.left + trigger.width / 2;
  const cy = trigger.top + trigger.height / 2;

  switch (placement) {
    case 'bottom':
      return {
        top: trigger.bottom + OFFSET_PX,
        left: cx - tip.width / 2,
      };
    case 'left':
      return {
        top: cy - tip.height / 2,
        left: trigger.left - tip.width - OFFSET_PX,
      };
    case 'right':
      return {
        top: cy - tip.height / 2,
        left: trigger.right + OFFSET_PX,
      };
    case 'top':
    default:
      return {
        top: trigger.top - tip.height - OFFSET_PX,
        left: cx - tip.width / 2,
      };
  }
}

function clampToViewport(top: number, left: number, tip: DOMRect): { top: number; left: number } {
  const pad = 4;
  const maxLeft = window.innerWidth - tip.width - pad;
  const maxTop = window.innerHeight - tip.height - pad;
  return {
    top: Math.min(Math.max(pad, top), Math.max(pad, maxTop)),
    left: Math.min(Math.max(pad, left), Math.max(pad, maxLeft)),
  };
}

export const Tooltip = forwardRef<HTMLElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = 'top',
      delayMs = 200,
      disabled = false,
    },
    ref,
  ) => {
    const tipId = useId();
    const triggerRef = useRef<HTMLElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    const setTriggerRef = useCallback(
      (node: HTMLElement | null) => {
        triggerRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    const clearShowTimer = useCallback(() => {
      if (showTimer.current != null) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
    }, []);

    const scheduleOpen = useCallback(() => {
      if (disabled || content == null || content === '') return;
      clearShowTimer();
      showTimer.current = setTimeout(() => setOpen(true), delayMs);
    }, [clearShowTimer, content, delayMs, disabled]);

    const close = useCallback(() => {
      clearShowTimer();
      setOpen(false);
      setCoords(null);
    }, [clearShowTimer]);

    useEffect(() => () => clearShowTimer(), [clearShowTimer]);

    useEffect(() => {
      if (!open) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') close();
      };
      const onScroll = () => close();
      window.addEventListener('keydown', onKey);
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onScroll);
      return () => {
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onScroll);
      };
    }, [close, open]);

    useLayoutEffect(() => {
      if (!open || !triggerRef.current || !tipRef.current) return;
      const trigger = triggerRef.current.getBoundingClientRect();
      const tip = tipRef.current.getBoundingClientRect();
      const raw = computePosition(trigger, tip, placement);
      setCoords(clampToViewport(raw.top, raw.left, tip));
    }, [open, placement, content]);

    const tipStyle: CSSProperties = {
      top: coords?.top ?? -9999,
      left: coords?.left ?? -9999,
      visibility: coords ? 'visible' : 'hidden',
    };

    const describedByWhenOpen = open ? tipId : undefined;
    const hoverHandlers = {
      onMouseEnter: scheduleOpen,
      onMouseLeave: close,
      onFocus: scheduleOpen,
      onBlur: close,
    };

    const childArray = Children.toArray(children);
    const onlyChild = childArray.length === 1 ? childArray[0] : undefined;
    let trigger: ReactNode;

    if (isValidElement(onlyChild)) {
      const child = onlyChild as ReactElement<TriggerProps>;
      const childRef = (child as { ref?: Ref<HTMLElement> }).ref ?? child.props.ref;
      const describedBy = [child.props['aria-describedby'], describedByWhenOpen]
        .filter(Boolean)
        .join(' ');
      trigger = cloneElement(child, {
        ref: mergeRefs(childRef, setTriggerRef),
        onMouseEnter: chain(child.props.onMouseEnter, hoverHandlers.onMouseEnter),
        onMouseLeave: chain(child.props.onMouseLeave, hoverHandlers.onMouseLeave),
        onFocus: chain(child.props.onFocus, hoverHandlers.onFocus),
        onBlur: chain(child.props.onBlur, hoverHandlers.onBlur),
        'aria-describedby': describedBy || undefined,
        ...(triggerNeedsTabIndex(child) ? { tabIndex: 0 } : {}),
      });
    } else {
      trigger = (
        <span
          ref={setTriggerRef}
          tabIndex={0}
          aria-describedby={describedByWhenOpen}
          onMouseEnter={hoverHandlers.onMouseEnter}
          onMouseLeave={hoverHandlers.onMouseLeave}
          onFocus={hoverHandlers.onFocus}
          onBlur={hoverHandlers.onBlur}
          style={{ display: 'inline-flex', maxWidth: '100%', verticalAlign: 'middle' }}
        >
          {children}
        </span>
      );
    }

    return (
      <>
        {trigger}
        {open && typeof document !== 'undefined'
          ? createPortal(
              <div
                ref={tipRef}
                id={tipId}
                role="tooltip"
                className={mergeClassName(tooltipRecipe({ placement }))}
                style={tipStyle}
              >
                {content}
              </div>,
              document.body,
            )
          : null}
      </>
    );
  },
);

Tooltip.displayName = 'Tooltip';

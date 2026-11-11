'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
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

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  tabIndex?: number;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
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

// Strict mode runs effects twice; a module flag keeps the warning to one call per session.
let hasWarnedHiddenTrigger = false;

// style-check keep: types the process global, since the component tsconfig does not load @types/node.
declare const process: { env: { NODE_ENV?: string } };

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

/** Makes a trigger that isn't a tab stop into one; wrap a disabled button yourself. */
export const Tooltip = forwardRef<HTMLElement, TooltipProps>(
  ({ content, children, placement = 'top', delayMs = 200, disabled = false }, ref) => {
    const tipId = useId();
    const triggerRef = useRef<HTMLElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const [shouldAddTabStop, setShouldAddTabStop] = useState(false);
    const [isWrapped, setIsWrapped] = useState(false);
    const canOpen = !disabled && content != null && content !== '';

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
      if (!canOpen) return;
      clearShowTimer();
      showTimer.current = setTimeout(() => setOpen(true), delayMs);
    }, [canOpen, clearShowTimer, delayMs]);

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

    // style-check keep: syncs the trigger's DOM aria-describedby with the open tooltip.
    useLayoutEffect(() => {
      const node = triggerRef.current;
      if (!open || !node) return;
      // Set on the node rather than cloned as a prop: Checkbox, Radio and the Field controls set
      // their own aria-describedby before spreading props, and a cloned one would replace it.
      node.setAttribute(
        'aria-describedby',
        [node.getAttribute('aria-describedby'), tipId].filter(Boolean).join(' '),
      );
      return () => {
        node.setAttribute(
          'aria-describedby',
          (node.getAttribute('aria-describedby') ?? '')
            .split(' ')
            .filter((id) => id !== '' && id !== tipId)
            .join(' '),
        );
        if (node.getAttribute('aria-describedby') === '') node.removeAttribute('aria-describedby');
      };
    }, [open, tipId]);

    const tipStyle: CSSProperties = {
      top: coords?.top ?? -9999,
      left: coords?.left ?? -9999,
      visibility: coords ? 'visible' : 'hidden',
    };

    const hoverHandlers = {
      onMouseEnter: scheduleOpen,
      onMouseLeave: close,
      onFocus: scheduleOpen,
      onBlur: close,
    };

    const childArray = Children.toArray(children);
    // Cloning keeps the child's own element, layout, ref and tab stop. A Fragment takes no ref or
    // handlers, so it's wrapped like text.
    const child =
      !isWrapped &&
      childArray.length === 1 &&
      isValidElement<TriggerProps>(childArray[0]) &&
      childArray[0].type !== Fragment
        ? childArray[0]
        : undefined;

    // style-check keep: reads the rendered DOM after every commit (no dependency list) to tell whether the trigger is a tab stop.
    useLayoutEffect(() => {
      const node = triggerRef.current;
      // A child that never attaches the ref doesn't forward cloned props, so it's wrapped instead.
      if (!node) {
        setIsWrapped(true);
        return;
      }
      if (shouldAddTabStop) {
        // The tab stop went out on the last render. A child that dropped it dropped the handlers too.
        if (child && canOpen && !node.hasAttribute('tabindex')) setIsWrapped(true);
        return;
      }
      if (
        child?.props.tabIndex != null ||
        [node, ...node.querySelectorAll('*')].some((element) =>
          element.matches(
            'a[href], area[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), summary, iframe, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex^="-"])',
          ),
        )
      ) {
        return;
      }
      setShouldAddTabStop(true);
      // process.env.NODE_ENV comes last: bundlers fold it to false in production, and a page
      // without a bundler only reads it for a hidden trigger.
      if (
        !hasWarnedHiddenTrigger &&
        node.getAttribute('aria-hidden') === 'true' &&
        process.env.NODE_ENV !== 'production'
      ) {
        hasWarnedHiddenTrigger = true;
        console.warn(
          '[Becket UI] Tooltip: the trigger is aria-hidden, so its tab stop has no accessible name. Give an Icon trigger a label.',
        );
      }
    });

    return (
      <>
        {child ? (
          cloneElement(child, {
            ref: mergeRefs(child.props.ref, setTriggerRef),
            onMouseEnter: chain(child.props.onMouseEnter, hoverHandlers.onMouseEnter),
            onMouseLeave: chain(child.props.onMouseLeave, hoverHandlers.onMouseLeave),
            onFocus: chain(child.props.onFocus, hoverHandlers.onFocus),
            onBlur: chain(child.props.onBlur, hoverHandlers.onBlur),
            // Only when added: a cloned tabIndex, even undefined, would replace the child's own.
            ...(child.props.tabIndex == null && shouldAddTabStop && canOpen ? { tabIndex: 0 } : {}),
          })
        ) : (
          <span
            ref={setTriggerRef}
            tabIndex={shouldAddTabStop && canOpen ? 0 : undefined}
            onMouseEnter={hoverHandlers.onMouseEnter}
            onMouseLeave={hoverHandlers.onMouseLeave}
            onFocus={hoverHandlers.onFocus}
            onBlur={hoverHandlers.onBlur}
            style={{ display: 'inline-flex', maxWidth: '100%', verticalAlign: 'middle' }}
          >
            {children}
          </span>
        )}
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

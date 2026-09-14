'use client';

/**
 * Hover / focus tooltip (generic DS primitive).
 * Default placement top, open delay 200ms.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
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

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
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
    const triggerRef = useRef<HTMLSpanElement | null>(null);
    const tipRef = useRef<HTMLDivElement | null>(null);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    const setTriggerRef = useCallback(
      (node: HTMLSpanElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
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

    return (
      <>
        <span
          ref={setTriggerRef}
          tabIndex={0}
          aria-describedby={open ? tipId : undefined}
          onMouseEnter={scheduleOpen}
          onMouseLeave={close}
          onFocus={scheduleOpen}
          onBlur={close}
          style={{ display: 'inline-flex', maxWidth: '100%', verticalAlign: 'middle' }}
        >
          {children}
        </span>
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

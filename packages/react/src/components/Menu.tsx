'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DetailsHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type ToggleEvent,
} from 'react';
import { menu as menuRecipe } from '@becket-ui/tokens/recipes';

type MenuContextValue = {
  close: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function menuItems(root: HTMLDetailsElement | null) {
  return [...(root?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])];
}

export type MenuProps = Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'onToggle'> & {
  label: ReactNode;
};

export const Menu = forwardRef<HTMLDetailsElement, MenuProps>(
  ({ label, className, children, onKeyDown, ...props }, ref) => {
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const [expanded, setExpanded] = useState(false);
    const styles = menuRecipe();

    const close = () => {
      if (detailsRef.current) detailsRef.current.open = false;
    };

    const focusItem = (index: number) => {
      const items = menuItems(detailsRef.current);
      if (items.length === 0) return;
      const next = items[(index + items.length) % items.length];
      next?.focus();
    };

    const onMenuKeyDown = (event: KeyboardEvent<HTMLDetailsElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const details = detailsRef.current;
      if (!details) return;

      if (event.key === 'Escape') {
        close();
        details.querySelector('summary')?.focus();
        return;
      }

      if (event.key === 'Tab' && details.open) {
        close();
        return;
      }

      if (event.key === 'Home' && details.open) {
        event.preventDefault();
        focusItem(0);
        return;
      }

      if (event.key === 'End' && details.open) {
        event.preventDefault();
        const items = menuItems(details);
        focusItem(items.length - 1);
        return;
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const items = menuItems(details);
      if (items.length === 0) return;
      if (!details.open) {
        details.open = true;
        requestAnimationFrame(() => focusItem(event.key === 'ArrowUp' ? -1 : 0));
        return;
      }
      const current = document.activeElement;
      const index = items.findIndex((item) => item === current);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      focusItem(index < 0 ? 0 : index + delta);
    };

    return (
      <MenuContext.Provider value={{ close }}>
        <details
          ref={(node) => {
            detailsRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={mergeClassName(styles.root, className)}
          {...props}
          onToggle={(event: ToggleEvent<HTMLDetailsElement>) => {
            const next = event.currentTarget.open;
            setExpanded(next);
            if (next) {
              requestAnimationFrame(() => focusItem(0));
            }
          }}
          onKeyDown={onMenuKeyDown}
        >
          <summary
            className={styles.trigger}
            aria-haspopup="menu"
            aria-expanded={expanded}
          >
            {label}
          </summary>
          <div className={styles.content} role="menu">
            {children}
          </div>
        </details>
      </MenuContext.Provider>
    );
  },
);

Menu.displayName = 'Menu';

type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ className, onClick, type = 'button', tabIndex = -1, ...props }, ref) => {
    const menu = useContext(MenuContext);
    const styles = menuRecipe();
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        {...props}
        tabIndex={tabIndex}
        className={mergeClassName(styles.item, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) menu?.close();
        }}
      />
    );
  },
);

MenuItem.displayName = 'MenuItem';

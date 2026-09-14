'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  type ButtonHTMLAttributes,
  type DetailsHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { menu as menuRecipe } from '@becket-ui/tokens/recipes';

type MenuContextValue = {
  close: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type MenuProps = Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'onToggle'> & {
  label: ReactNode;
};

export const Menu = forwardRef<HTMLDetailsElement, MenuProps>(
  ({ label, className, children, onKeyDown, ...props }, ref) => {
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const styles = menuRecipe();

    const close = () => {
      if (detailsRef.current) detailsRef.current.open = false;
    };

    const onMenuKeyDown = (event: KeyboardEvent<HTMLDetailsElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        close();
        detailsRef.current?.querySelector('summary')?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const items = [
        ...(detailsRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
      ];
      if (items.length === 0) return;
      event.preventDefault();
      const current = document.activeElement;
      const index = items.findIndex((item) => item === current);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = items[(index + delta + items.length) % items.length];
      next?.focus();
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
          onKeyDown={onMenuKeyDown}
        >
          <summary className={styles.trigger}>{label}</summary>
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
  ({ className, onClick, type = 'button', ...props }, ref) => {
    const menu = useContext(MenuContext);
    const styles = menuRecipe();
    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        {...props}
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

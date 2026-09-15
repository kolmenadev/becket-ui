'use client';

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { tabs as tabsRecipe } from '@becket-ui/tokens/recipes';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs parts must be used within Tabs');
  }
  return ctx;
}

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type TabsProps = ComponentPropsWithoutRef<'div'> & {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const selected = isControlled ? value : uncontrolled;
    const baseId = useId();
    const styles = tabsRecipe();

    const setValue = (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    };

    const ctx = useMemo(
      () => ({ value: selected, setValue, baseId }),
      [baseId, selected],
    );

    return (
      <TabsContext.Provider value={ctx}>
        <div ref={ref} {...props} className={mergeClassName(styles.root, className)}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = 'Tabs';

export const TabList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const styles = tabsRecipe();

    const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const tabs = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      ];
      if (tabs.length === 0) return;
      const index = tabs.findIndex((tab) => tab === document.activeElement);
      const focusTab = (nextIndex: number) => {
        const next = tabs[(nextIndex + tabs.length) % tabs.length];
        next?.focus();
        next?.click();
      };
      if (event.key === 'Home') {
        event.preventDefault();
        focusTab(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        focusTab(tabs.length - 1);
        return;
      }
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      focusTab(index < 0 ? 0 : index + delta);
    };

    return (
      <div
        ref={ref}
        role="tablist"
        {...props}
        aria-orientation="horizontal"
        className={mergeClassName(styles.list, className)}
        onKeyDown={onListKeyDown}
      />
    );
  },
);

TabList.displayName = 'TabList';

type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  ({ value, className, type = 'button', ...props }, ref) => {
    const { value: selected, setValue, baseId } = useTabs();
    const styles = tabsRecipe();
    const selectedNow = selected === value;
    return (
      <button
        ref={ref}
        type={type}
        role="tab"
        id={`${baseId}-tab-${value}`}
        aria-selected={selectedNow}
        aria-controls={`${baseId}-panel-${value}`}
        tabIndex={selectedNow ? 0 : -1}
        {...props}
        className={mergeClassName(styles.tab, className)}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) setValue(value);
        }}
      />
    );
  },
);

Tab.displayName = 'Tab';

type TabPanelProps = ComponentPropsWithoutRef<'div'> & {
  value: string;
};

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selected, baseId } = useTabs();
    const styles = tabsRecipe();
    if (selected !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        {...props}
        className={mergeClassName(styles.panel, className)}
      >
        {children}
      </div>
    );
  },
);

TabPanel.displayName = 'TabPanel';

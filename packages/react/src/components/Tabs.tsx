'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
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

// style-check keep: the two TabsProps branches share these props; written twice they could drift.
type TabsBaseProps = ComponentPropsWithoutRef<'div'> & {
  onValueChange?: (value: string) => void;
  children?: ReactNode;
};

export type TabsProps =
  | (TabsBaseProps & { value: string; defaultValue?: string })
  | (TabsBaseProps & { value?: undefined; defaultValue: string });

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const isControlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
    const selected = isControlled ? value : uncontrolled;
    const baseId = useId();
    const styles = tabsRecipe();

    const onValueChangeRef = useRef(onValueChange);
    // Assigned during render on purpose: the next event must see this render's callback.
    onValueChangeRef.current = onValueChange;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;

    // The memo below keeps every Tab from re-rendering on unrelated parent renders, so this
    // callback must stay stable and read the latest props through the refs.
    const setValue = useCallback((next: string) => {
      if (!isControlledRef.current) setUncontrolled(next);
      onValueChangeRef.current?.(next);
    }, []);

    const ctx = useMemo(
      () => ({ value: selected, setValue, baseId }),
      [baseId, selected, setValue],
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

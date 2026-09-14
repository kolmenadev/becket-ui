'use client';

import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';
import { card } from '@becket-ui/tokens/recipes';

type CardSize = 'sm' | 'md' | 'lg';
type CardVisual = 'outline' | 'subtle' | 'elevated';

type CardContextValue = {
  size: CardSize;
  visual: CardVisual;
};

const CardContext = createContext<CardContextValue>({ size: 'md', visual: 'subtle' });

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type CardProps = ComponentPropsWithoutRef<'div'> & {
  size?: CardSize;
  visual?: CardVisual;
  /** Stretch to the parent width. Default wraps to content (`fit-content`). */
  fullWidth?: boolean;
  as?: ElementType;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      size = 'md',
      visual = 'subtle',
      fullWidth = false,
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const styles = card({ size, visual, fullWidth });

    return (
      <CardContext.Provider value={{ size, visual }}>
        <Component ref={ref} {...props} className={mergeClassName(styles.root, className)}>
          {children}
        </Component>
      </CardContext.Provider>
    );
  },
);

Card.displayName = 'Card';

function useCardStyles() {
  const { size, visual } = useContext(CardContext);
  return card({ size, visual });
}

type CardSlotProps = ComponentPropsWithoutRef<'div'> & {
  as?: ElementType;
  children?: ReactNode;
};

export const CardHeader = forwardRef<HTMLDivElement, CardSlotProps>(
  ({ as: Component = 'div', className, ...props }, ref) => {
    const styles = useCardStyles();
    return (
      <Component ref={ref} {...props} className={mergeClassName(styles.header, className)} />
    );
  },
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, CardSlotProps>(
  ({ as: Component = 'div', className, ...props }, ref) => {
    const styles = useCardStyles();
    return (
      <Component ref={ref} {...props} className={mergeClassName(styles.body, className)} />
    );
  },
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, CardSlotProps>(
  ({ as: Component = 'div', className, ...props }, ref) => {
    const styles = useCardStyles();
    return (
      <Component ref={ref} {...props} className={mergeClassName(styles.footer, className)} />
    );
  },
);
CardFooter.displayName = 'CardFooter';

export const CardTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h3'> & { as?: ElementType }>(
  ({ as: Component = 'h3', className, ...props }, ref) => {
    const styles = useCardStyles();
    return (
      <Component ref={ref} {...props} className={mergeClassName(styles.title, className)} />
    );
  },
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'> & { as?: ElementType }>(
  ({ as: Component = 'p', className, ...props }, ref) => {
    const styles = useCardStyles();
    return (
      <Component ref={ref} {...props} className={mergeClassName(styles.description, className)} />
    );
  },
);
CardDescription.displayName = 'CardDescription';

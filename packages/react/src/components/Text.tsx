import { forwardRef, type ElementType, type Ref } from 'react';
import { css, splitCssProps, type JsxStyleProps } from '@becket-ui/tokens';

/** Style props still need Panda or precompiled values. */
export type TextProps<T extends ElementType = 'p' | 'span' | 'div' | 'strong' | 'em' | 'label'> =
  React.ComponentPropsWithoutRef<T> &
  JsxStyleProps & {
    as?: T;
  };

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as, children, css: cssProp, className, ...rest }, ref) => {
    // A union of elements rejects one prop spread: each element's event handlers are invariant.
    const Component = (as ?? 'p') as ElementType;
    // splitCssProps separates style props from DOM props so the DOM remainder can be spread.
    const [styleProps, domProps] = splitCssProps(rest);
    return (
      <Component
        // forwardRef types the ref as HTMLElement; `as` is polymorphic, so the element type is only known at runtime.
        ref={ref as Ref<never>}
        {...domProps}
        className={[css(styleProps, cssProp), className].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </Component>
    );
  },
);

Text.displayName = 'Text';

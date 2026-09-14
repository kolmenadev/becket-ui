import { forwardRef, type ElementType } from 'react';
import { css, type JsxStyleProps } from '@becket-ui/tokens';

type BaseElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'label';

export type TextProps<T extends ElementType = BaseElement> = React.ComponentPropsWithoutRef<T> &
  JsxStyleProps & {
    as?: T;
  };

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as, children, css: cssProp, className, ...rest }, ref) => {
    const Component = (as ?? 'p') as ElementType;
    const styleClassName = css(rest as JsxStyleProps);
    return (
      <Component ref={ref as any} className={mergeClassName(styleClassName, className)}>
        {children}
      </Component>
    );
  },
);

Text.displayName = 'Text';



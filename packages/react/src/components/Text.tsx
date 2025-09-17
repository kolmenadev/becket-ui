import { ElementType, forwardRef } from 'react';
import { css, type JsxStyleProps } from '@maverick/tokens';

type BaseElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'label';

type TextProps<T extends ElementType = BaseElement> = React.ComponentPropsWithoutRef<T> &
  JsxStyleProps & {
    as?: T;
  };

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as, children, css: cssProp, className, ...rest }, ref) => {
    const Component = (as ?? 'p') as ElementType;
    const classNames = css(rest as JsxStyleProps);
    return (
      <Component ref={ref as any} className={classNames}>
        {children}
      </Component>
    );
  },
);

Text.displayName = 'Text';



import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { badge } from '@becket-ui/tokens/recipes';

import {
  resolveLabelColorVars,
  type LabelCustomColors,
  type LabelVisual,
} from '../helpers/labelColors';

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  size?: BadgeSize;
  visual?: LabelVisual;
  borderRadius?: BadgeBorderRadius;
  withGradient?: boolean;
  customColors?: LabelCustomColors;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      size = 'md',
      visual = 'neutral',
      borderRadius = 'full',
      withGradient = false,
      customColors,
      as: Component = 'span',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const recipeClassName = badge({ size, visual, borderRadius, withGradient });
    const colorVars = resolveLabelColorVars(visual, withGradient, customColors);

    return (
      <Component
        ref={ref}
        {...props}
        style={{ ...colorVars, ...style }}
        className={mergeClassName(recipeClassName, className)}
      />
    );
  },
);

Badge.displayName = 'Badge';

export type { LabelCustomColors, LabelVisual };

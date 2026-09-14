import { forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { tag } from '@becket-ui/tokens/recipes';

import {
  resolveLabelColorVars,
  type LabelCustomColors,
  type LabelVisual,
} from '../helpers/labelColors';

type TagSize = 'sm' | 'md' | 'lg';
type TagBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type TagProps = ComponentPropsWithoutRef<'span'> & {
  size?: TagSize;
  visual?: LabelVisual;
  borderRadius?: TagBorderRadius;
  withGradient?: boolean;
  customColors?: LabelCustomColors;
  as?: ElementType;
};

function mergeClassName(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
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
    const recipeClassName = tag({ size, visual, borderRadius, withGradient });
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

Tag.displayName = 'Tag';

export type { LabelCustomColors, LabelVisual };

import { defineRecipe } from '@pandacss/dev';

export const spinner = defineRecipe({
  className: 'spinner',
  description: 'Pure CSS loading spinner',
  base: {
    display: 'inline-block',
    boxSizing: 'border-box',
    flexShrink: 0,
    verticalAlign: 'middle',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'neutral.600',
    borderTopColor: 'primary',
    borderRadius: 'full',
    animationName: 'spin',
    animationDuration: '0.7s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    _light: {
      borderColor: 'neutral.300',
      borderTopColor: 'primary',
    },
  },
  variants: {
    size: {
      sm: { width: '{fontSizes.md}', height: '{fontSizes.md}' },
      md: { width: '{fontSizes.xl}', height: '{fontSizes.xl}' },
      lg: { width: '{fontSizes.2xl}', height: '{fontSizes.2xl}' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

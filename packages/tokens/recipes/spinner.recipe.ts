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
      sm: { width: '1rem', height: '1rem' },
      md: { width: '1.5rem', height: '1.5rem' },
      lg: { width: '2rem', height: '2rem' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

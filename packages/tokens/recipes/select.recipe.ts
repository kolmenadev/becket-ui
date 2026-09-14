import { defineRecipe } from '@pandacss/dev';
import { controlChrome, controlInvalidVariants, controlSizeVariants } from './controlStyles';

const chevron =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\'%3E%3Cpath d=\'M4 6.5 8 10.5 12 6.5\' stroke=\'%23a1a1aa\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")';

export const selectRecipe = defineRecipe({
  className: 'select',
  description: 'Native select. Label / helper / error live on Field.',
  base: {
    ...controlChrome,
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: chevron,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.6rem center',
    backgroundSize: '1rem',
    paddingRight: '8',
  },
  variants: {
    size: controlSizeVariants,
    invalid: controlInvalidVariants,
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

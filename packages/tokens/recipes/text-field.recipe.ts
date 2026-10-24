import { defineRecipe } from '@pandacss/dev';
import { controlChrome, controlInvalidVariants, controlSizeVariants } from './controlStyles';

/** Native text input styles. Label / helper / error live on Field. */
export const textFieldRecipe: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'textField',
  description: 'Styles for the TextField / FieldControl input',
  base: controlChrome,
  variants: {
    size: controlSizeVariants,
    invalid: controlInvalidVariants,
  },
  defaultVariants: {
    size: 'md',
    invalid: false,
  },
});

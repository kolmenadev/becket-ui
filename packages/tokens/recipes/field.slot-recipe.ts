import { defineSlotRecipe } from '@pandacss/dev';

/** Shared label / helper / error chrome for form controls. */
export const field = defineSlotRecipe({
  className: 'field',
  description: 'Field composition: label, helper, and error around a control',
  slots: ['root', 'label', 'helper', 'error'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      width: 'field',
      maxWidth: '100%',
      minWidth: 0,
    },
    label: {
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'text',
    },
    helper: {
      fontSize: 'xs',
      color: 'muted',
    },
    error: {
      fontSize: 'xs',
      color: 'danger',
    },
  },
  variants: {
    size: {
      sm: {
        label: { fontSize: 'xs' },
        helper: { fontSize: 'xs' },
        error: { fontSize: 'xs' },
      },
      md: {
        label: { fontSize: 'sm' },
        helper: { fontSize: 'xs' },
        error: { fontSize: 'xs' },
      },
      lg: {
        label: { fontSize: 'md' },
        helper: { fontSize: 'sm' },
        error: { fontSize: 'sm' },
      },
    },
    fullWidth: {
      true: {
        root: { width: '100%' },
      },
      false: {
        root: { width: 'field', maxWidth: '100%' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    fullWidth: false,
  },
});

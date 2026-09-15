import { defineRecipe } from '@pandacss/dev';

export const link = defineRecipe({
  className: 'link',
  description: 'Inline link',
  base: {
    color: 'primary',
    textDecoration: 'underline',
    textUnderlineOffset: '0.15em',
    cursor: 'pointer',
    _hover: { color: 'primaryHover' },
    _focusVisible: {
      outline: 'none',
      boxShadow: 'outline',
      borderRadius: 'sm',
    },
  },
  variants: {
    visual: {
      default: {},
      muted: {
        color: 'muted',
        textDecoration: 'none',
        _hover: { color: 'text', textDecoration: 'underline' },
      },
    },
    visited: {
      true: {
        _visited: { color: 'secondary' },
      },
      false: {},
    },
  },
  defaultVariants: {
    visual: 'default',
    visited: false,
  },
});

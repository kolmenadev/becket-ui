import { defineRecipe } from '@pandacss/dev';

export const link: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'link',
  description: 'Inline link',
  base: {
    color: 'link',
    textDecoration: 'underline',
    textUnderlineOffset: '{spacing.text-1}',
    cursor: 'pointer',
    _hover: { color: 'linkHover' },
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
        _visited: { color: 'linkVisited' },
      },
      false: {},
    },
  },
  defaultVariants: {
    visual: 'default',
    visited: false,
  },
});

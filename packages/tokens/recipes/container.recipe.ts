import { defineRecipe } from '@pandacss/dev';

export const container = defineRecipe({
  className: 'container',
  description: 'Centered page-width wrapper with inline gutters',
  base: {
    width: '100%',
    marginInline: 'auto',
    boxSizing: 'border-box',
  },
  variants: {
    size: {
      sm: { maxWidth: '3xl' },
      md: { maxWidth: '5xl' },
      lg: { maxWidth: '6xl' },
      xl: { maxWidth: '7xl' },
      full: { maxWidth: 'none' },
    },
    padding: {
      none: { paddingInline: '0' },
      xs: { paddingInline: 'xs' },
      sm: { paddingInline: 'sm' },
      md: { paddingInline: 'md' },
      lg: { paddingInline: 'lg' },
      xl: { paddingInline: 'xl' },
    },
  },
  defaultVariants: {
    size: 'lg',
    padding: 'md',
  },
});

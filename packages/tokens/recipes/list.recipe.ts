import { defineRecipe } from '@pandacss/dev';

export const list = defineRecipe({
  className: 'list',
  description: 'Bulleted, numbered or plain list',
  base: {
    margin: 0,
    paddingInlineStart: '1.25em',
    color: 'text',
    '& > li::marker': { color: 'muted' },
  },
  variants: {
    spacing: {
      xs: { '& > li + li': { marginTop: 'xs' } },
      sm: { '& > li + li': { marginTop: 'sm' } },
      md: { '& > li + li': { marginTop: 'md' } },
    },
    marker: {
      disc: { listStyleType: 'disc' },
      decimal: { listStyleType: 'decimal' },
      none: { listStyleType: 'none', paddingInlineStart: '0' },
    },
  },
  defaultVariants: { spacing: 'sm', marker: 'disc' },
});

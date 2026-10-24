import { defineRecipe } from '@pandacss/dev';

export const list: ReturnType<typeof defineRecipe> = defineRecipe({
  className: 'list',
  description: 'Bulleted, numbered or plain list',
  base: {
    margin: 0,
    paddingInlineStart: 'text-5',
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
      decimal: { listStyleType: 'decimal', paddingInlineStart: 'text-8' },
      none: { listStyleType: 'none', paddingInlineStart: '0' },
    },
  },
  defaultVariants: { spacing: 'sm', marker: 'disc' },
});

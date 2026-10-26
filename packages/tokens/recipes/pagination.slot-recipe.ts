import { defineSlotRecipe } from '@pandacss/dev';

export const pagination: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'pagination',
  description: 'Page links for a paged list, with previous and next',
  slots: ['root', 'list', 'link', 'ellipsis'],
  base: {
    list: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '1',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'xs',
      // Square page numbers at the button's height, so they line up with buttons beside them.
      minWidth: 'calc(1lh + 2 * var(--becket-pagination-py))',
      // WCAG 2.5.8 floor, in case a theme shrinks the button density.
      minHeight: '24px',
      paddingInline: 'var(--becket-pagination-py)',
      paddingBlock: 'var(--becket-pagination-py)',
      borderRadius: 'md',
      color: 'text',
      fontFamily: 'sans',
      fontWeight: 'medium',
      lineHeight: 'normal',
      fontVariantNumeric: 'tabular-nums',
      textDecoration: 'none',
      _focusVisible: { outline: 'none', boxShadow: 'outline' },
      // Hover is scoped to plain page links: Panda 2 sorts selectors, so a later override on the
      // current or unavailable link can't be relied on to win.
      '&[href]:not([aria-current="page"])': {
        _hover: { backgroundColor: 'neutral.800', _light: { backgroundColor: 'neutral.100' } },
      },
      // Brand fill takes neutral.900 ink: cream on yellow fails AA.
      '&[aria-current="page"]': {
        backgroundColor: 'primary',
        color: 'neutral.900',
        _hover: { backgroundColor: 'primaryHover' },
      },
      // Previous on the first page and Next on the last render without an href.
      '&:not([href])': { color: 'muted', cursor: 'default' },
    },
    ellipsis: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 'calc(1lh + 2 * var(--becket-pagination-py))',
      color: 'muted',
      lineHeight: 'normal',
    },
  },
  variants: {
    size: {
      // Same block padding as Button, so a page link and a button of one size are equally tall.
      sm: {
        root: { '--becket-pagination-py': 'var(--beckui-button-py-sm)' },
        link: { fontSize: 'sm' },
        ellipsis: { fontSize: 'sm' },
      },
      md: {
        root: { '--becket-pagination-py': 'var(--beckui-button-py-md)' },
        link: { fontSize: 'md' },
        ellipsis: { fontSize: 'md' },
      },
    },
  },
  defaultVariants: { size: 'md' },
});

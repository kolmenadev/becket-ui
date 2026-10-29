import { defineSlotRecipe } from '@pandacss/dev';

export const breadcrumb: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'breadcrumb',
  description: 'The trail of pages leading to the current one',
  slots: ['root', 'list', 'item', 'link'],
  base: {
    list: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'xs',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      fontFamily: 'sans',
      lineHeight: 'normal',
      color: 'muted',
    },
    item: { display: 'inline-flex', alignItems: 'center', gap: 'xs' },
    link: {
      color: 'muted',
      textDecoration: 'none',
      borderRadius: 'sm',
      _hover: { color: 'text', textDecoration: 'underline' },
      _focusVisible: { outline: 'none', boxShadow: 'outline' },
      '&[aria-current="page"]': { color: 'text', fontWeight: 'medium' },
    },
  },
  variants: {
    size: {
      sm: { list: { fontSize: 'sm' } },
      md: { list: { fontSize: 'md' } },
    },
    // Drawn between items in CSS, with empty alternative text, so screen readers don't read them.
    separator: {
      chevron: {
        list: {
          '& > li + li::before': {
            content: '"" / ""',
            // A glyph in a line of text follows the type scale (becket.mdc "Sizing and spacing").
            width: '{fontSizes.text-md}',
            height: '{fontSizes.text-md}',
            backgroundColor: 'currentColor',
            maskImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 6l6 6-6 6'/%3E%3C/svg%3E\")",
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
          },
        },
      },
      slash: { list: { '& > li + li::before': { content: '"/" / ""' } } },
    },
  },
  defaultVariants: { size: 'sm', separator: 'chevron' },
});

import { defineRecipe } from '@pandacss/dev';

/**
 * Select descendant elements with zero specificity, skipping anything inside
 * `[data-not-prose]`, so Becket components embedded in an article keep their
 * own styles and consumer classes always win.
 */
const el = (selector: string) => `& :where(${selector}):not(:where([data-not-prose], [data-not-prose] *))`;

export const prose = defineRecipe({
  className: 'prose',
  description: 'Styles HTML from Markdown or MDX (headings, text, lists, quotes, code, tables, media) with Becket tokens',
  // Rules and frames use neutral.700 on dark like Separator; the `border` token is too bright there.
  base: {
    color: 'text',
    fontFamily: 'sans',
    lineHeight: 'loose',
    maxWidth: 'prose',
    // Rhythm uses the em-based `text-*` tokens so the `size` variant scales the whole article.
    [el('p')]: { marginBlock: 'text-5' },
    [el('h1, h2, h3, h4')]: {
      fontWeight: 'bold',
      lineHeight: 'tight',
      color: 'text',
      scrollMarginTop: '5',
    },
    [el('h1')]: { fontSize: 'text-2xl', marginBlock: '0 {spacing.text-3}' },
    [el('h2')]: { fontSize: 'text-xl', marginBlock: '{spacing.text-8} {spacing.text-3}' },
    [el('h3')]: { fontSize: 'text-lg', marginBlock: '{spacing.text-8} {spacing.text-2}' },
    [el('h4')]: { fontSize: 'text-md', marginBlock: '{spacing.text-5} {spacing.text-2}' },
    [el('h2 + *, h3 + *, h4 + *')]: { marginTop: '0' },
    [el('a')]: {
      color: 'link',
      textDecoration: 'underline',
      textUnderlineOffset: '{spacing.text-1}',
      _hover: { color: 'linkHover' },
      _focusVisible: { outline: 'none', boxShadow: 'outline', borderRadius: 'sm' },
    },
    [el('strong')]: { fontWeight: 'bold', color: 'text' },
    [el('ul, ol')]: { marginBlock: 'text-5', paddingInlineStart: 'text-5' },
    [el('ul')]: { listStyleType: 'disc' },
    // Room for two-digit markers.
    [el('ol')]: { listStyleType: 'decimal', paddingInlineStart: 'text-8' },
    [el('li')]: { marginBlock: 'text-2', paddingInlineStart: 'text-1' },
    [`${el('li')}::marker`]: { color: 'muted' },
    [el('li > ul, li > ol')]: { marginBlock: 'text-2' },
    [el('blockquote')]: {
      marginBlock: 'text-8',
      paddingInlineStart: 'text-5',
      borderInlineStartWidth: '3px',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'primary',
      color: 'muted',
      fontStyle: 'italic',
    },
    [el('hr')]: {
      marginBlock: 'text-13',
      border: 'none',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: 'neutral.700',
      _light: { borderTopColor: 'border' },
    },
    [el(':not(pre) > code')]: {
      fontFamily: 'mono',
      fontSize: 'text-sm',
      bg: 'surface',
      borderRadius: 'sm',
      paddingInline: 'text-1',
      paddingBlock: 'text-1',
    },
    [el('pre')]: {
      marginBlock: 'text-8',
      padding: 'md',
      overflowX: 'auto',
      bg: 'surface',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'neutral.700',
      _light: { borderColor: 'border' },
      borderRadius: 'md',
      fontFamily: 'mono',
      fontSize: 'text-sm',
      lineHeight: 'normal',
    },
    [el('pre code')]: { fontFamily: 'inherit', fontSize: 'inherit', bg: 'transparent', padding: '0' },
    [el('kbd')]: {
      fontFamily: 'mono',
      fontSize: 'text-sm',
      paddingInline: 'text-2',
      paddingBlock: 'text-1',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'neutral.700',
      _light: { borderColor: 'border' },
      borderBottomWidth: '2px',
      borderRadius: 'sm',
      bg: 'surface',
    },
    [el('mark')]: { bg: 'primary', color: 'neutral.900', borderRadius: 'sm', paddingInline: 'text-1' },
    [el('img, video')]: { display: 'block', maxWidth: '100%', height: 'auto', borderRadius: 'md' },
    [el('figure')]: { marginBlock: 'text-8' },
    [el('figure > img, figure > video')]: { marginBlock: '0' },
    [el('figcaption')]: { marginTop: 'text-3', fontSize: 'text-sm', color: 'muted' },
    [el('table')]: {
      width: '100%',
      marginBlock: 'text-8',
      borderCollapse: 'collapse',
      fontSize: 'text-sm',
      lineHeight: 'normal',
    },
    [el('thead th')]: {
      textAlign: 'start',
      fontWeight: 'bold',
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'neutral.700',
      _light: { borderBottomColor: 'border' },
    },
    [el('th, td')]: { paddingBlock: 'text-2', paddingInline: 'text-3' },
    [el('tbody tr')]: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'neutral.700',
      _light: { borderBottomColor: 'border' },
    },
    [el('dt')]: { fontWeight: 'bold', marginTop: 'text-5' },
    [el('dd')]: { marginTop: 'text-2', paddingInlineStart: 'text-5' },
    [el('sup')]: { fontSize: 'text-xs' },
    '& > :where(:first-child)': { marginTop: '0' },
    '& > :where(:last-child)': { marginBottom: '0' },
  },
  variants: {
    size: {
      sm: { fontSize: 'sm' },
      md: { fontSize: 'md' },
      lg: { fontSize: 'lg' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

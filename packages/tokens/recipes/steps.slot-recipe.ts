import { defineSlotRecipe } from '@pandacss/dev';

export const steps: ReturnType<typeof defineSlotRecipe> = defineSlotRecipe({
  className: 'steps',
  description: 'A display-only list of the steps in a process and where the user is',
  slots: ['root', 'step', 'marker', 'content', 'title', 'description'],
  base: {
    root: {
      display: 'flex',
      gap: 'sm',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      fontFamily: 'sans',
      lineHeight: 'normal',
      counterReset: 'becket-step',
    },
    step: {
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'sm',
      counterIncrement: 'becket-step',
      color: 'muted',
      '&[data-status="current"], &[data-status="complete"]': { color: 'text' },
    },
    marker: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: 'var(--becket-steps-marker)',
      height: 'var(--becket-steps-marker)',
      borderRadius: 'full',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'neutral.700',
      _light: { borderColor: 'border' },
      fontWeight: 'medium',
      fontVariantNumeric: 'tabular-nums',
      // The step's number, unless a glyph (the completed check) fills the marker.
      '&:empty::before': { content: 'counter(becket-step)' },
      '[data-status="current"] > &': { borderColor: 'primary', _light: { borderColor: 'primary' } },
      // Brand fill takes neutral.900 ink: cream on yellow fails AA.
      '[data-status="complete"] > &': {
        backgroundColor: 'primary',
        borderColor: 'primary',
        color: 'neutral.900',
        _light: { borderColor: 'primary' },
      },
    },
    content: { display: 'flex', flexDirection: 'column', gap: '1', minWidth: 0 },
    title: { fontWeight: 'medium' },
    // Relative to the list's size: a Step has no context to read Steps' `size` from.
    description: { color: 'muted', fontSize: 'text-sm' },
  },
  variants: {
    orientation: {
      // A line after every step but the last, on the marker's centre line; done steps colour it.
      horizontal: {
        root: {
          flexDirection: 'row',
          '& > li': { flex: '1' },
          '& > li:not(:last-child)::after': {
            content: '""',
            flex: '1',
            alignSelf: 'flex-start',
            marginTop: 'calc(var(--becket-steps-marker) / 2)',
            borderTopWidth: '2px',
            borderTopStyle: 'solid',
            // Same pairing as the marker's ring: `border` is a light neutral in both themes.
            borderColor: 'neutral.700',
            _light: { borderColor: 'border' },
          },
          // Its own light rule, so it outranks the one above by specificity, not source order.
          '& > li[data-status="complete"]:not(:last-child)::after': {
            borderColor: 'primary',
            _light: { borderColor: 'primary' },
          },
        },
      },
      vertical: {
        root: {
          flexDirection: 'column',
          '& > li': { paddingBottom: 'md' },
          '& > li:not(:last-child)::after': {
            content: '""',
            position: 'absolute',
            top: 'var(--becket-steps-marker)',
            bottom: 0,
            insetInlineStart: 'calc(var(--becket-steps-marker) / 2 - 1px)',
            borderInlineStartWidth: '2px',
            borderInlineStartStyle: 'solid',
            borderColor: 'neutral.700',
            _light: { borderColor: 'border' },
          },
          '& > li[data-status="complete"]:not(:last-child)::after': {
            borderColor: 'primary',
            _light: { borderColor: 'primary' },
          },
        },
      },
    },
    size: {
      // Consecutive Fibonacci sizes for a box that stands on its own: 20 and 32px at a 16px root.
      sm: { root: { '--becket-steps-marker': '{sizes.5}', fontSize: 'sm' } },
      md: { root: { '--becket-steps-marker': '{sizes.8}', fontSize: 'md' } },
    },
  },
  defaultVariants: { orientation: 'horizontal', size: 'md' },
});

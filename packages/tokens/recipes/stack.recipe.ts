import { defineRecipe } from "@pandacss/dev";

export const stack = defineRecipe({
  className: 'stack',
  description: 'The styles for the Stack component',
  base: {
    display: 'flex',
  },
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
    gap: {
      none: { gap: 0},
      xs: { gap: 1 },
      sm: { gap: 2 },
      md: { gap: 3 },
      lg: { gap: 5 },
      xl: { gap: 8 },
      '2xs': { gap: 13 },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
      baseline: { alignItems: 'baseline' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
      around: { justifyContent: 'space-around' },
      evenly: { justifyContent: 'space-evenly' },
    },
  },
  defaultVariants: {
    direction: 'column',
    gap: 'md',
    align: 'start',
    justify: 'center'
  },
})
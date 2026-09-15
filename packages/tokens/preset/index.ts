import { definePreset } from '@pandacss/dev';
import {
  badge,
  button,
  card,
  checkbox,
  dialog,
  drawer,
  field,
  heading,
  hide,
  link,
  radio,
  menu,
  selectRecipe,
  separator,
  spinner,
  switchRecipe,
  table,
  tabs,
  tag,
  textareaRecipe,
  textFieldRecipe,
  tooltip,
} from '../recipes';
import {
  breakpoints,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  gradients,
  keyframes,
  lineHeights,
  radii,
  semanticColors,
  shadows,
  sizes,
  spacing,
} from './theme-tokens';

/** Class / CSS-variable prefix. Set `prefix` on the consumer `defineConfig` to match. */
export const BECKET_PREFIX = 'beckui-';

export { colorRef, gradientRef, spacingRef } from './theme-tokens';

export const becketPreset = definePreset({
  name: '@becket-ui/tokens',
  conditions: {
    extend: {
      light: "[data-theme='light'] &",
      dark: "[data-theme='dark'] &",
    },
  },
  theme: {
    extend: {
      tokens: {
        colors,
        gradients,
        spacing,
        sizes,
        radii,
        fonts,
        fontSizes,
        fontWeights,
        lineHeights,
        shadows,
      },
      semanticTokens: {
        colors: semanticColors,
      },
      keyframes,
      breakpoints,
      recipes: {
        button,
        heading,
        hide,
        tag,
        badge,
        card,
        field,
        switchRecipe,
        textFieldRecipe,
        checkbox,
        radio,
        selectRecipe,
        textareaRecipe,
        dialog,
        drawer,
        menu,
        tabs,
        table,
        spinner,
        link,
        separator,
        tooltip,
      },
    },
  },
});

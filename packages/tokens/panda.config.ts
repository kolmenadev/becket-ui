import { defineConfig } from '@pandacss/dev';
import { BECKET_PREFIX, becketPreset } from './preset';

export default defineConfig({
  preflight: true,
  include: ['../react/src/**/*.{js,ts,jsx,tsx}'],
  prefix: BECKET_PREFIX,
  jsxFramework: 'react',
  // Becket exports its own Box and Container components. Rename Panda's built-in
  // patterns so the extractor doesn't read their props as style props.
  patterns: {
    extend: {
      box: { jsxName: 'PandaBox' },
      container: { jsxName: 'PandaContainer' },
    },
  },
  outdir: 'styled-system',
  // The React package imports the generated system as @becket-ui/tokens/* (and css from the root
  // entry). Panda 2 only extracts calls from the modules listed here; without this, css() and
  // pattern styles in components (SimpleGrid's child rules, say) never reach index.css.
  importMap: ['@becket-ui/tokens', { css: '@becket-ui/tokens' }],
  // Relative imports in the generated runtime and declarations end in .js, which TypeScript's
  // nodenext resolution requires (MAV-121).
  forceImportExtension: true,
  // Panda 2 no longer adds preset-base on its own once `presets` is set: without it, every
  // pattern except box and container (stack, flex, grid…) and the base utilities go missing.
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda', becketPreset],
  staticCss: {
    recipes: '*',
    css: [
      {
        properties: {
          // Fibonacci (0,1,2,3,5,8,13,21,34) + semantic + leftover Panda numeric keys still in CSS vars
          gap: [
            '0',
            '1',
            '2',
            '3',
            '5',
            '8',
            '13',
            '21',
            '34',
            '4',
            '6',
            'xs',
            'sm',
            'md',
            'lg',
            'xl',
            '2xl',
          ],
        },
      },
      {
        properties: {
          justifyContent: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
          alignItems: ['start', 'center', 'end', 'stretch', 'baseline'],
          flexWrap: ['wrap', 'nowrap', 'wrap-reverse'],
          flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
        },
      },
      {
        properties: {
          truncate: ['true'],
        },
      },
      {
        properties: {
          display: ['none', 'contents', 'block'],
        },
      },
      {
        properties: {
          display: ['none', 'contents', 'block'],
        },
        conditions: ['sm', 'md', 'lg', 'xl', '2xl'],
      },
      {
        properties: {
          gridTemplateColumns: [
            'repeat(1, minmax(0, 1fr))',
            'repeat(2, minmax(0, 1fr))',
            'repeat(3, minmax(0, 1fr))',
            'repeat(4, minmax(0, 1fr))',
            'repeat(auto-fit, minmax(8rem, 1fr))',
            'repeat(auto-fit, minmax(10rem, 1fr))',
            'repeat(auto-fit, minmax(12rem, 1fr))',
            'repeat(auto-fit, minmax(16rem, 1fr))',
          ],
        },
      },
      {
        properties: {
          gridTemplateColumns: [
            'repeat(1, minmax(0, 1fr))',
            'repeat(2, minmax(0, 1fr))',
            'repeat(3, minmax(0, 1fr))',
            'repeat(4, minmax(0, 1fr))',
          ],
        },
        conditions: ['sm', 'md', 'lg'],
      },
      {
        properties: {
          gap: ['0', '1', '2', '3', '5', '8', 'sm', 'md', 'lg', 'xl'],
        },
        conditions: ['sm', 'md', 'lg'],
      },
      // Grid / GridItem (12-column layout): every count and span, at every breakpoint.
      {
        properties: {
          gridTemplateColumns: Array.from({ length: 12 }, (_, i) => `repeat(${i + 1}, minmax(0, 1fr))`),
          gridColumn: [...Array.from({ length: 12 }, (_, i) => `span ${i + 1} / span ${i + 1}`), '1 / -1'],
        },
        conditions: ['base', 'sm', 'md', 'lg', 'xl', '2xl'],
      },
    ],
  },
});

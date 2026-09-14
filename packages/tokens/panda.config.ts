import { defineConfig } from '@pandacss/dev';
import { BECKET_PREFIX, becketPreset } from './preset';

export default defineConfig({
  preflight: true,
  include: ['../react/src/**/*.{js,ts,jsx,tsx}'],
  prefix: BECKET_PREFIX,
  jsxFramework: 'react',
  outdir: 'styled-system',
  presets: ['@pandacss/preset-panda', becketPreset],
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
            '2xs',
          ],
        },
      },
      {
        properties: {
          justifyContent: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
          alignItems: ['start', 'center', 'end', 'stretch', 'baseline'],
          flexWrap: ['wrap', 'nowrap', 'wrap-reverse'],
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
    ],
  },
});

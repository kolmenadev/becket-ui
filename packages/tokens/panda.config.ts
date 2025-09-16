import { defineConfig } from "@pandacss/dev";
import { button } from "./recipes";

export default defineConfig({
  preflight: true,
  include: ["../react/src/**/*.{js,ts,jsx,tsx}"],
  prefix: "mavui-",
  jsxFramework: "react",
  outdir: "styled-system",
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            maverickBlue:      { value: 'oklch(0.58 0.20 260)' }, // Bold, deep electric blue
            rebelMagenta:      { value: 'oklch(0.65 0.23 340)' }, // Vibrant, bold magenta
            innovationTeal:    { value: 'oklch(0.70 0.15 190)' }, // Fresh, tech-forward teal
          },
          primary:             { value: '{colors.brand.maverickBlue}' },
          primaryAccent:       { value: '{colors.brand.rebelMagenta}' },
          primaryHover:        { value: 'oklch(0.60 0.22 265)' },
        
          neutral: {
            50:   { value: 'oklch(0.97 0.005 260)' },
            100:  { value: 'oklch(0.94 0.005 260)' },
            200:  { value: 'oklch(0.89 0.005 260)' },
            300:  { value: 'oklch(0.84 0.005 260)' },
            400:  { value: 'oklch(0.75 0.005 260)' },
            500:  { value: 'oklch(0.65 0.005 260)' },
            600:  { value: 'oklch(0.55 0.005 260)' },
            700:  { value: 'oklch(0.45 0.005 260)' },
            800:  { value: 'oklch(0.35 0.005 260)' },
            900:  { value: 'oklch(0.25 0.005 260)' },
          },
        
          black:               { value: 'oklch(20% 0 0)' },
          white:               { value: 'oklch(99% 0 0)' },
          background:          { value: '{colors.white}' },
          surface:             { value: '{colors.neutral.50}' },
          border:              { value: '{colors.neutral.200}' },
        
          danger:              { value: 'oklch(0.62 0.20 25)' },
          warning:             { value: 'oklch(0.80 0.19 80)' },
          success:             { value: 'oklch(0.68 0.18 140)' },
        
          text:                { value: '{colors.neutral.900}' },
          muted:               { value: '{colors.neutral.600}' },
        },
      
        spacing: {
          0: { value: '0rem' },
          1: { value: '0.25rem' },
          2: { value: '0.5rem' },
          3: { value: '0.75rem' },
          5: { value: '1.25rem' },
          8: { value: '2rem' },
          13: { value: '3.25rem' },
          21: { value: '5.25rem' },
          34: { value: '8.5rem' },

          // semantic aliases so patterns can use md, etc.
          xs:  { value: '{spacing.1}' },
          sm:  { value: '{spacing.2}' },
          md:  { value: '{spacing.3}' },
          lg:  { value: '{spacing.5}' },
          xl:  { value: '{spacing.8}' },
          '2xs': { value: '{spacing.13}' },
        },
      
        radii: {
          none: { value: '0px' },
          sm: { value: '4px' },
          md: { value: '8px' },
          lg: { value: '12px' },
          xl: { value: '20px' },
          full: { value: '9999px' }
        },
      
        fonts: {
          sans: { value: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif" },
          mono: { value: "'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'" },
        },
        fontSizes: {
          xs:  { value: '0.75rem' },  
          sm:  { value: '0.875rem' }, 
          md:  { value: '1rem' },     
          lg:  { value: '1.25rem' },  
          xl:  { value: '1.5rem' },   
          '2xl': { value: '2rem' },   
          '3xl': { value: '3rem' },   
        },
        fontWeights: {
          normal: { value: '400' },
          medium: { value: '500' },
          bold: { value: '700' }
        },
        lineHeights: {
          normal: { value: '1.5' },
          tight: { value: '1.25' },
          loose: { value: '1.75' }
        },
      
        shadows: {
          sm: { value: '0 1px 3px 0 oklch(0% 0 0 / 0.08)' },
          md: { value: '0 3px 6px 0 oklch(0% 0 0 / 0.12)' },
          lg: { value: '0 8px 16px 0 oklch(0% 0 0 / 0.16)' }
        },
      },
      recipes: {
        button,
      }
    },
  },
  staticCss: {
    recipes: '*',
    css: [
      {
        properties: {
          gap: ['xs', 'sm', 'md', 'lg', 'xl', '2xs'],
        },
      },
    ],
  },
  conditions: {
    dark: "[data-theme='dark'] &"
  }
});

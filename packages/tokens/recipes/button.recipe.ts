import { defineRecipe } from '@pandacss/dev';
import { filledGradient, outlineGradient } from './gradientStyles';

export const button = defineRecipe({
  className: 'button',
  description: 'The styles for the Button component',
  base: {
    cursor: 'pointer',
    fontWeight: 'bold',
    px: 4,
    py: 2,
    transition: 'all 0.2s',
    _focus: { outline: 'none', boxShadow: 'outline' },
    _disabled: { opacity: 0.6, cursor: 'not-allowed' },
  },
  variants: {
    visual: {
      primary: {
        backgroundColor: 'primary',
        color: 'text',
        _hover: { backgroundColor: 'primaryHover' },
      },
      secondary: {
        backgroundColor: 'secondary',
        color: 'text',
        _hover: {
          backgroundColor: 'secondary',
        },
      },
      neutral: {
        // Dark: elevated surface + light text (neutral.100 + text was unreadable).
        backgroundColor: 'neutral.600',
        color: 'text',
        _hover: {
          backgroundColor: 'neutral.500',
        },
        _light: {
          backgroundColor: 'neutral.200',
          color: 'lightText',
          _hover: {
            backgroundColor: 'neutral.300',
          },
        },
      },
      outline: {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'secondary',
        color: 'secondary',
        backgroundColor: 'transparent',
        _hover: { backgroundColor: 'neutral.800' },
        _light: {
          _hover: { backgroundColor: 'neutral.100' },
        },
      },
    },
    size: {
      sm: { fontSize: 'sm', px: 3, py: 1 },
      md: { fontSize: 'md', px: 4, py: 2 },
    },
    borderRadius: {
      none: { borderRadius: 'none' },
      sm: { borderRadius: 'sm' },
      md: { borderRadius: 'md' },
      lg: { borderRadius: 'lg' },
      xl: { borderRadius: 'xl' },
      full: { borderRadius: 'full' },
    },
    withGradient: {
      false: {},
      true: {},
    },
  },
  compoundVariants: [
    {
      visual: 'primary',
      withGradient: true,
      css: {
        ...filledGradient('{gradients.primary}'),
        color: 'text',
        _hover: {
          backgroundImage: '{gradients.primaryHover}',
        },
      },
    },
    {
      visual: 'secondary',
      withGradient: true,
      css: {
        ...filledGradient('{gradients.secondary}'),
        color: 'text',
      },
    },
    {
      visual: 'neutral',
      withGradient: true,
      css: {
        ...filledGradient('{gradients.neutral}'),
        color: 'text',
        _light: {
          color: 'lightText',
        },
      },
    },
    {
      visual: 'outline',
      withGradient: true,
      css: {
        ...outlineGradient('{gradients.primary}'),
        color: 'secondary',
      },
    },
  ],
  defaultVariants: {
    visual: 'outline',
    size: 'md',
    borderRadius: 'md',
    withGradient: false,
  },
});

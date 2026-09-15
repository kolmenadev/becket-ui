import { defineRecipe } from '@pandacss/dev';
import { filledGradient, outlineGradient } from './gradientStyles';
import { buttonSizeStyles } from './density';

export const button = defineRecipe({
  className: 'button',
  description: 'The styles for the Button component',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    paddingInline: 'var(--beckui-button-px-md)',
    paddingBlock: 'var(--beckui-button-py-md)',
    transition: 'all 0.2s',
    width: 'field',
    maxWidth: '100%',
    boxSizing: 'border-box',
    _focus: { outline: 'none', boxShadow: 'outline' },
    _disabled: { opacity: 0.6, cursor: 'not-allowed' },
  },
  variants: {
    visual: {
      primary: {
        backgroundColor: 'primary',
        color: 'neutral.900',
        _hover: { backgroundColor: 'primaryHover' },
      },
      secondary: {
        backgroundColor: 'secondary',
        color: 'neutral.900',
        _hover: {
          backgroundColor: 'secondary',
        },
      },
      neutral: {
        backgroundColor: 'neutral.800',
        color: 'neutral.50',
        _hover: {
          backgroundColor: 'neutral.700',
        },
        _light: {
          backgroundColor: 'neutral.200',
          color: 'neutral.900',
          _hover: {
            backgroundColor: 'neutral.300',
          },
        },
      },
      outline: {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'accent',
        color: 'accent',
        backgroundColor: 'transparent',
        _hover: { backgroundColor: 'neutral.800' },
        _light: {
          _hover: { backgroundColor: 'neutral.100' },
        },
      },
    },
    size: buttonSizeStyles,
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
    fullWidth: {
      true: { width: '100%' },
      false: { width: 'field', maxWidth: '100%' },
    },
  },
  compoundVariants: [
    {
      visual: 'primary',
      withGradient: true,
      css: {
        ...filledGradient('{gradients.primary}'),
        color: 'neutral.900',
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
        color: 'neutral.900',
      },
    },
    {
      visual: 'neutral',
      withGradient: true,
      css: {
        ...filledGradient('{gradients.neutral}'),
        color: 'neutral.900',
      },
    },
    {
      visual: 'outline',
      withGradient: true,
      css: {
        ...outlineGradient('{gradients.primary}'),
        color: 'accent',
      },
    },
  ],
  defaultVariants: {
    visual: 'outline',
    size: 'md',
    borderRadius: 'md',
    withGradient: false,
    fullWidth: false,
  },
});

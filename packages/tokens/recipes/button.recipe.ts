import { defineRecipe } from '@pandacss/dev';

export const button = defineRecipe({
  className: 'button',
  description: 'The styles for the Button component',
  base: {
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: 'md',
    px: 4,
    py: 2,
    transition: 'all 0.2s',
    _focus: { outline: 'none', boxShadow: 'outline' },
    _disabled: { opacity: 0.6, cursor: 'not-allowed' },
  },
  variants: {
    visual: {
      primary: {
        bg: 'primary',
        color: 'white',
        _hover: { bg: 'primaryHover' },
      },
      secondary: {
        bg: 'secondary',
        color: 'white',
        _hover: {
          bg: 'secondary',
        },
      },
      neutral: {
        bg: 'neutral.100',
        color: 'text',
        _hover: {
          bg: 'neutral.200',
        },
      },
      outline: {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'secondary',
        color: 'secondary',
        bg: 'transparent',
        _hover: { bg: 'blue.50' },
      },
    },
    size: {
      sm: { fontSize: 'sm', px: 3, py: 1 },
      md: { fontSize: 'md', px: 4, py: 2 },
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
        bg: 'transparent',
        color: 'white',
        backgroundImage: '{gradients.primary}',
        _hover: {
          backgroundImage: '{gradients.primaryHover}',
        },
      },
    },
    {
      visual: 'secondary',
      withGradient: true,
      css: {
        bg: 'transparent',
        color: 'white',
        backgroundImage: '{gradients.secondary}',
        borderColor: 'transparent',
      },
    },
    {
      visual: 'neutral',
      withGradient: true,
      css: {
        bg: 'transparent',
        color: 'text',
        backgroundImage: '{gradients.neutral}',
      },
    },
    {
      visual: 'outline',
      withGradient: true,
      css: {
        position: 'relative',
        bg: 'background',
        backgroundClip: 'padding-box',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        color: 'secondary',
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          margin: '-2px',
          zIndex: -1,
          borderRadius: 'inherit',
          backgroundImage: '{gradients.primary}',
        },
      },
    },
  ],
  defaultVariants: {
    visual: 'outline',
    size: 'md',
    withGradient: false,
  },
});

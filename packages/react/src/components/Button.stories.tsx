import type { Meta, StoryObj } from '@storybook/react';
import { Button, type ButtonProps } from './Button';
import { button as buttonRecipe } from '@becket-ui/tokens/recipes';

const meta: Meta<typeof Button> = {
  title: 'Buttons/Button',
  component: Button,
  args: {
    children: 'Click me',
    visual: 'primary',
    size: 'md',
    borderRadius: 'md',
    withGradient: false,
  },
  argTypes: {
    visual: { control: { type: 'select' }, options: buttonRecipe.variantMap.visual },
    size: { control: { type: 'select' }, options: buttonRecipe.variantMap.size },
    borderRadius: {
      control: { type: 'select' },
      options: buttonRecipe.variantMap.borderRadius,
    },
    withGradient: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
  },
  parameters: {
    controls: {
      include: ['visual', 'size', 'borderRadius', 'withGradient', 'disabled', 'children'],
    },
  },
};
export default meta;

type Story = StoryObj<ButtonProps>;

export const Default: Story = {};

export const WithGradient: Story = {
  args: {
    children: 'Gradient',
    visual: 'primary',
    withGradient: true,
  },
};

/**
 * Custom CSS can override the default button styles. Pass `className` to merge
 * your own classes (e.g. from Panda's `css()`) or use the `style` prop for
 * inline overrides.
 */
export const WithCssOverride: Story = {
  args: {
    children: 'Overridden styles',
    visual: 'primary',
    style: {
      background: 'rebeccapurple',
      borderRadius: '9999px',
      color: 'white',
      padding: '0.75rem 1.5rem',
    },
  },
};

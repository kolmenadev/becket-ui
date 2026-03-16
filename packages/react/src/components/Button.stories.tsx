import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { button as buttonRecipe } from '@maverick/tokens/recipes';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    visual: { control: { type: 'select' }, options: buttonRecipe.variantMap.visual },
    size: { control: { type: 'select' }, options: buttonRecipe.variantMap.size },
    borderRadius: {
      control: { type: 'select' },
      options: buttonRecipe.variantMap.borderRadius,
    },
    withGradient: { control: { type: 'boolean' } },
    className: { control: { type: 'text' }, description: 'Custom class to override styles' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
    visual: 'primary',
    size: 'md',
    borderRadius: 'md',
    withGradient: false,
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

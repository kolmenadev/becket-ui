import type { Meta, StoryObj } from '@storybook/react';
import { button as buttonRecipe } from '@becket-ui/tokens/recipes';
import { defineBecketTheme } from '@becket-ui/tokens/theme';
import { Button, type ButtonProps } from './Button';
import { Stack } from './Stack';
import { Text } from './Text';

const brandThemeCss = defineBecketTheme({
  colors: { primary: 'oklch(0.82 0.14 280)' },
});

const densityCss = defineBecketTheme({
  density: { button: { md: { px: '0.4rem', py: '0.15rem' } } },
});

const meta: Meta<typeof Button> = {
  title: 'Buttons/Button',
  component: Button,
  args: {
    children: 'Click me',
    visual: 'primary',
    size: 'md',
    borderRadius: 'md',
    withGradient: false,
    fullWidth: false,
  },
  argTypes: {
    visual: { control: { type: 'select' }, options: buttonRecipe.variantMap.visual },
    size: { control: { type: 'select' }, options: buttonRecipe.variantMap.size },
    borderRadius: {
      control: { type: 'select' },
      options: buttonRecipe.variantMap.borderRadius,
    },
    withGradient: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
  },
  parameters: {
    controls: {
      include: [
        'visual',
        'size',
        'borderRadius',
        'withGradient',
        'fullWidth',
        'disabled',
        'children',
      ],
    },
  },
};
export default meta;

type Story = StoryObj<ButtonProps>;

export const Default: Story = {};

export const ForcedColors: Story = { ...Default, parameters: { forcedColors: true } };

export const WithGradient: Story = {
  args: {
    children: 'Gradient',
    visual: 'primary',
    withGradient: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full width',
    fullWidth: true,
  },
};

export const BrandTheme: Story = {
  render: (args) => (
    <>
      <style>{brandThemeCss}</style>
      <Stack gap="md" align="start">
        <Text fontSize="sm" color="muted" maxW="34">
          Injects <code>--beckui--colors-primary: oklch(0.82 0.14 280)</code> (violet)
          so theming is obvious. Default primary is yellow.
        </Text>
        <Button {...args}>Brand primary</Button>
        <Button {...args} withGradient>
          Brand gradient
        </Button>
      </Stack>
    </>
  ),
  args: {
    visual: 'primary',
  },
};

export const InstanceOverride: Story = {
  args: {
    children: 'One-off override',
    visual: 'primary',
    style: {
      background: 'rebeccapurple',
      borderRadius: '9999px',
      color: 'white',
      padding: '0.75rem 1.5rem',
    },
  },
};

export const DensityOverride: Story = {
  render: (args) => (
    <>
      <style>{densityCss}</style>
      <Stack gap="md" align="start" style={{ padding: '1rem' }}>
        <Button {...args}>Dense md</Button>
        <Button {...args} size="sm">
          Dense sm (unchanged vars)
        </Button>
      </Stack>
    </>
  ),
  args: {
    visual: 'primary',
    size: 'md',
  },
};

export const AsLink: Story = {
  render: () => (
    <Button as="a" href="https://github.com/kolmenadev/becket-ui" visual="primary">
      View on GitHub
    </Button>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { HStack, Stack } from './Stack';
import { Badge, type BadgeProps } from './Badge';
import { badge as badgeRecipe } from '@becket-ui/tokens/recipes';

const meta: Meta<typeof Badge> = {
  title: 'Data Display/Badge',
  component: Badge,
  args: {
    children: 'New',
    visual: 'primary',
    size: 'md',
    borderRadius: 'full',
    withGradient: false,
  },
  argTypes: {
    visual: { control: { type: 'select' }, options: badgeRecipe.variantMap.visual },
    size: { control: { type: 'select' }, options: badgeRecipe.variantMap.size },
    borderRadius: {
      control: { type: 'select' },
      options: badgeRecipe.variantMap.borderRadius,
    },
    withGradient: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
  },
  parameters: {
    controls: {
      include: ['visual', 'size', 'borderRadius', 'withGradient', 'children'],
    },
  },
};
export default meta;

type Story = StoryObj<BadgeProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="sm" align="center">
      <Badge size="sm">New</Badge>
      <Badge size="md">Beta</Badge>
      <Badge size="lg">Draft</Badge>
    </HStack>
  ),
};

export const Visuals: Story = {
  render: () => (
    <HStack gap="sm" align="center" style={{ flexWrap: 'wrap' }}>
      <Badge visual="primary">Primary</Badge>
      <Badge visual="secondary">Secondary</Badge>
      <Badge visual="neutral">Neutral</Badge>
      <Badge visual="outline">Outline</Badge>
    </HStack>
  ),
};

export const WithGradient: Story = {
  args: {
    children: 'New',
    visual: 'primary',
    withGradient: true,
  },
};

export const CustomColors: Story = {
  render: () => (
    <HStack gap="sm">
      <Badge
        customColors={{
          background: '#14532d',
          color: '#dcfce7',
          border: '#22c55e',
        }}
      >
        New
      </Badge>
      <Badge
        customColors={{
          background: '#7f1d1d',
          color: '#fee2e2',
          border: '#ef4444',
        }}
      >
        Alert
      </Badge>
    </HStack>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Stack gap="sm" style={{ maxWidth: '5rem' }}>
      <Badge>Notification</Badge>
    </Stack>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { box as boxRecipe } from '@becket-ui/tokens/recipes';
import { Box, type BoxProps } from './Box';
import { HStack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Box> = {
  title: 'Layout/Box',
  component: Box,
  args: { padding: 'md', background: 'subtle', radius: 'md' },
  argTypes: {
    padding: { control: { type: 'select' }, options: boxRecipe.variantMap.padding },
    background: { control: { type: 'select' }, options: boxRecipe.variantMap.background },
    radius: { control: { type: 'select' }, options: boxRecipe.variantMap.radius },
  },
  parameters: {
    controls: { include: ['padding', 'background', 'radius'] },
  },
};
export default meta;

type Story = StoryObj<BoxProps>;

export const Default: Story = {
  render: (args) => (
    <Box {...args}>
      <Text>A block with token padding, surface and radius.</Text>
    </Box>
  ),
};

export const Backgrounds: Story = {
  render: () => (
    <HStack gap="md">
      {boxRecipe.variantMap.background.map((background) => (
        <Box key={background} background={background} padding="md" radius="md">
          <Text fontSize="sm">{background}</Text>
        </Box>
      ))}
    </HStack>
  ),
};

export const Radii: Story = {
  render: () => (
    <HStack gap="md">
      {boxRecipe.variantMap.radius.map((radius) => (
        <Box key={radius} background="subtle" padding="md" radius={radius}>
          <Text fontSize="sm">{radius}</Text>
        </Box>
      ))}
    </HStack>
  ),
};

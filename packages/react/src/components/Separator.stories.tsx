import type { Meta, StoryObj } from '@storybook/react';
import { separator as separatorRecipe } from '@becket-ui/tokens/recipes';
import { HStack, Stack } from './Stack';
import { Text } from './Text';
import { Separator, type SeparatorProps } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'Layout/Separator',
  component: Separator,
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: separatorRecipe.variantMap.orientation,
    },
    decorative: { control: { type: 'boolean' } },
  },
  parameters: {
    controls: { include: ['orientation', 'decorative'] },
  },
};
export default meta;

type Story = StoryObj<SeparatorProps>;

export const Default: Story = {};

export const Vertical: Story = {
  render: () => (
    <HStack gap="md" style={{ height: '3rem', alignItems: 'stretch' }}>
      <Text>Left</Text>
      <Separator orientation="vertical" />
      <Text>Right</Text>
    </HStack>
  ),
};

export const InStack: Story = {
  render: () => (
    <Stack gap="md">
      <Text>Above</Text>
      <Separator />
      <Text>Below</Text>
    </Stack>
  ),
};

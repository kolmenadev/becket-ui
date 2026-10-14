import type { Meta, StoryObj } from '@storybook/react';
import { avatar as avatarRecipe } from '@becket-ui/tokens/recipes';
import { SAMPLE_PORTRAIT } from '../helpers/storybookImages';
import { Avatar, type AvatarProps } from './Avatar';
import { HStack } from './Stack';

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace', size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: avatarRecipe.variantMap.size },
    name: { control: { type: 'text' } },
  },
  parameters: { controls: { include: ['name', 'size'] } },
};
export default meta;

type Story = StoryObj<AvatarProps>;

export const Default: Story = { render: (args) => <Avatar {...args} src={SAMPLE_PORTRAIT} /> };

export const Initials: Story = { render: (args) => <Avatar {...args} /> };

export const Sizes: Story = {
  render: () => (
    <HStack gap="sm" align="center">
      {avatarRecipe.variantMap.size.map((size) => (
        <Avatar key={size} name="Grace Hopper" size={size} />
      ))}
      <Avatar name="Alan Turing" size="lg" src={SAMPLE_PORTRAIT} />
    </HStack>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { Mark, type MarkProps } from './Mark';
import { Text } from './Text';

const meta: Meta<typeof Mark> = { title: 'Typography/Mark', component: Mark };
export default meta;

type Story = StoryObj<MarkProps>;

export const Default: Story = {
  render: () => (
    <Text>
      Search results show the <Mark>matching words</Mark> highlighted.
    </Text>
  ),
};

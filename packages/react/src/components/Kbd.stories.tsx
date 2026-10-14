import type { Meta, StoryObj } from '@storybook/react';
import { Kbd, type KbdProps } from './Kbd';
import { Text } from './Text';

const meta: Meta<typeof Kbd> = { title: 'Typography/Kbd', component: Kbd };
export default meta;

type Story = StoryObj<KbdProps>;

export const Default: Story = {
  render: () => (
    <Text>
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>Esc</Kbd> to close.
    </Text>
  ),
};

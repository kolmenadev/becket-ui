import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Text } from './Text';
import { Menu, MenuItem, type MenuProps } from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'Overlays/Menu',
  component: Menu,
  args: { label: 'Actions' },
  argTypes: {
    label: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['label'] },
  },
};
export default meta;

type Story = StoryObj<MenuProps>;

export const Default: Story = {
  render: function MenuDemo(args: MenuProps) {
    const [last, setLast] = useState('none');
    return (
      <>
        <Menu {...args}>
          <MenuItem onClick={() => setLast('Edit')}>Edit</MenuItem>
          <MenuItem onClick={() => setLast('Duplicate')}>Duplicate</MenuItem>
          <MenuItem onClick={() => setLast('Delete')}>Delete</MenuItem>
        </Menu>
        <Text>Last action: {last}</Text>
      </>
    );
  },
};

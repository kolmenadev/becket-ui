import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch, type SwitchProps } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  args: {
    size: 'md',
    disabled: false,
  },
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    checked: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  parameters: {
    controls: { include: ['size', 'checked', 'disabled'] },
  },
};
export default meta;

type Story = StoryObj<SwitchProps>;

export const Default: Story = {
  args: {
    size: 'md',
    disabled: false,
    defaultChecked: false,
    'aria-label': 'Notifications',
  },
};

export const Checked: Story = {
  args: {
    size: 'md',
    defaultChecked: true,
    'aria-label': 'Enabled',
  },
};

export const Disabled: Story = {
  args: {
    size: 'md',
    defaultChecked: true,
    disabled: true,
    'aria-label': 'Disabled switch',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Switch size="sm" defaultChecked aria-label="Small" />
      <Switch size="md" defaultChecked aria-label="Medium" />
      <Switch size="lg" defaultChecked aria-label="Large" />
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [on, setOn] = useState(false);
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Switch
          checked={on}
          onCheckedChange={setOn}
          aria-label="Controlled"
        />
        <span>{on ? 'On' : 'Off'}</span>
      </div>
    );
  },
};

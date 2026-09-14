import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { checkbox as checkboxRecipe } from '@becket-ui/tokens/recipes';
import { Stack } from './Stack';
import { Checkbox, type CheckboxProps } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: {
    size: 'md',
    disabled: false,
    label: 'Accept terms',
  },
  argTypes: {
    size: { control: { type: 'select' }, options: checkboxRecipe.variantMap.size },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    description: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'disabled', 'label', 'description'] },
  },
};
export default meta;

type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  args: {
    description: 'You can unsubscribe anytime.',
  },
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
    label: 'Checked',
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true, defaultChecked: true },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Checkbox size="sm" label="Small" defaultChecked />
      <Checkbox size="md" label="Medium" defaultChecked />
    </Stack>
  ),
};

export const Controlled: Story = {
  render: function ControlledCheckbox() {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="Controlled"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        description={checked ? 'On' : 'Off'}
      />
    );
  },
};

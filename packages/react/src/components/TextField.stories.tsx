import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from './Stack';
import { TextField, type TextFieldProps } from './TextField';
import { textFieldRecipe } from '@becket-ui/tokens/recipes';

const meta: Meta<typeof TextField> = {
  title: 'Forms/TextField',
  component: TextField,
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
    fullWidth: false,
  },
  argTypes: {
    size: { control: { type: 'select' }, options: textFieldRecipe.variantMap.size },
    invalid: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'invalid', 'disabled', 'fullWidth', 'label', 'placeholder'] },
  },
};
export default meta;

type Story = StoryObj<TextFieldProps>;

export const Default: Story = {
  args: {
    label: 'Offset',
    placeholder: '3',
    helperText: 'Optional helper text',
  },
};

export const Invalid: Story = {
  args: {
    label: 'Email',
    defaultValue: 'not-an-email',
    invalid: true,
    helperText: 'Enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    defaultValue: 'Locked',
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <TextField size="sm" label="Small" defaultValue="sm" />
      <TextField size="md" label="Medium" defaultValue="md" />
      <TextField size="lg" label="Large" defaultValue="lg" />
    </Stack>
  ),
};

export const FullWidth: Story = {
  args: {
    label: 'Full width',
    fullWidth: true,
    helperText: 'Stretches to the parent.',
  },
};

export const Controlled: Story = {
  render: function ControlledTextField() {
    const [value, setValue] = useState('3');
    return (
      <TextField
        label="Cents"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        helperText={`Current: ${value}`}
        inputMode="numeric"
      />
    );
  },
};

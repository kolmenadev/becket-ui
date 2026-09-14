import type { Meta, StoryObj } from '@storybook/react';
import { textareaRecipe } from '@becket-ui/tokens/recipes';
import { Stack } from './Stack';
import { Textarea, type TextareaProps } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
    fullWidth: false,
    label: 'Notes',
  },
  argTypes: {
    size: { control: { type: 'select' }, options: textareaRecipe.variantMap.size },
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

type Story = StoryObj<TextareaProps>;

export const Default: Story = {
  args: {
    placeholder: 'Write a short note',
    helperText: 'Resize is vertical.',
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: 'Too short',
    helperText: 'Add more detail',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Locked' },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Textarea size="sm" label="Small" defaultValue="sm" />
      <Textarea size="md" label="Medium" defaultValue="md" />
      <Textarea size="lg" label="Large" defaultValue="lg" />
    </Stack>
  ),
};

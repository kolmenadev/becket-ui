import type { Meta, StoryObj } from '@storybook/react';
import { selectRecipe } from '@becket-ui/tokens/recipes';
import { Stack } from './Stack';
import { Select, type SelectProps } from './Select';

const fruitOptions = (
  <>
    <option value="">Choose one</option>
    <option value="apple">Apple</option>
    <option value="pear">Pear</option>
    <option value="plum">Plum</option>
  </>
);

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
    fullWidth: false,
    label: 'Fruit',
    children: fruitOptions,
  },
  argTypes: {
    size: { control: { type: 'select' }, options: selectRecipe.variantMap.size },
    invalid: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'invalid', 'disabled', 'fullWidth', 'label'] },
  },
};
export default meta;

type Story = StoryObj<SelectProps>;

export const Default: Story = {
  args: { helperText: 'Native select — works without JS.' },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    helperText: 'Pick a fruit',
    defaultValue: '',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'pear' },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Select size="sm" label="Small" defaultValue="apple">
        {fruitOptions}
      </Select>
      <Select size="md" label="Medium" defaultValue="pear">
        {fruitOptions}
      </Select>
      <Select size="lg" label="Large" defaultValue="plum">
        {fruitOptions}
      </Select>
    </Stack>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { field as fieldRecipe } from '@becket-ui/tokens/recipes';
import { defineBecketTheme } from '@becket-ui/tokens/theme';
import {
  Field,
  FieldControl,
  FieldError,
  FieldHelper,
  FieldLabel,
  type FieldProps,
} from './Field';
import { Stack } from './Stack';

const fieldDensityCss = defineBecketTheme({
  density: { field: { md: { px: '0.35rem', py: '0.1rem' } } },
});

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  args: {
    size: 'md',
    invalid: false,
    fullWidth: false,
  },
  argTypes: {
    size: { control: { type: 'select' }, options: fieldRecipe.variantMap.size },
    invalid: { control: { type: 'boolean' } },
    fullWidth: { control: { type: 'boolean' } },
  },
  parameters: {
    controls: { include: ['size', 'invalid', 'fullWidth'] },
  },
};
export default meta;

type Story = StoryObj<FieldProps>;

export const Default: Story = {
  render: (args: FieldProps) => (
    <Field {...args}>
      <FieldLabel>Offset</FieldLabel>
      <FieldControl placeholder="3" />
      <FieldHelper>Optional helper text</FieldHelper>
    </Field>
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args: FieldProps) => (
    <Field {...args}>
      <FieldLabel>Email</FieldLabel>
      <FieldControl defaultValue="not-an-email" />
      <FieldError>Enter a valid email address</FieldError>
    </Field>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field size="sm">
        <FieldLabel>Small</FieldLabel>
        <FieldControl defaultValue="sm" />
      </Field>
      <Field size="md">
        <FieldLabel>Medium</FieldLabel>
        <FieldControl defaultValue="md" />
      </Field>
      <Field size="lg">
        <FieldLabel>Large</FieldLabel>
        <FieldControl defaultValue="lg" />
      </Field>
    </div>
  ),
};

/**
 * Field padding follows `--beckui-field-px-md`. Stack `gap="md"` does not.
 */
export const DensityOverride: Story = {
  render: (args: FieldProps) => (
    <>
      <style>{fieldDensityCss}</style>
      <Stack gap="md" align="start">
        <Field {...args}>
          <FieldLabel>Dense field</FieldLabel>
          <FieldControl placeholder="md padding vars" />
        </Field>
        <Field {...args} size="sm">
          <FieldLabel>sm (other vars)</FieldLabel>
          <FieldControl placeholder="sm" />
        </Field>
      </Stack>
    </>
  ),
};

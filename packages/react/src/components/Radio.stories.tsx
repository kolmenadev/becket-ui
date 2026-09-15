import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { radio as radioRecipe } from '@becket-ui/tokens/recipes';
import { Button } from './Button';
import { Field, FieldError } from './Field';
import { Stack } from './Stack';
import { Text } from './Text';
import { Radio, RadioGroup, type RadioGroupProps } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    size: 'md',
    disabled: false,
    legend: 'Plan',
    name: 'plan',
  },
  argTypes: {
    size: { control: { type: 'select' }, options: radioRecipe.variantMap.size },
    disabled: { control: { type: 'boolean' } },
    legend: { control: { type: 'text' } },
    name: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'disabled', 'legend', 'name'] },
  },
};
export default meta;

type Story = StoryObj<RadioGroupProps>;

function PlanRadios() {
  return (
    <>
      <Radio value="free" label="Free" description="Community support." />
      <Radio value="pro" label="Pro" description="Email support and extra seats." />
      <Radio value="team" label="Team" />
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <PlanRadios />
    </RadioGroup>
  ),
};

export const DefaultSelected: Story = {
  args: { defaultValue: 'pro' },
  render: (args) => (
    <RadioGroup {...args}>
      <PlanRadios />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'pro' },
  render: (args) => (
    <RadioGroup {...args}>
      <PlanRadios />
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="lg">
      <RadioGroup size="sm" name="size-sm" legend="Small" defaultValue="a">
        <Radio value="a" label="Alpha" />
        <Radio value="b" label="Beta" />
      </RadioGroup>
      <RadioGroup size="md" name="size-md" legend="Medium" defaultValue="a">
        <Radio value="a" label="Alpha" />
        <Radio value="b" label="Beta" />
      </RadioGroup>
    </Stack>
  ),
};

export const Controlled: Story = {
  render: function ControlledRadioGroup() {
    const [value, setValue] = useState('pro');
    return (
      <RadioGroup name="controlled-plan" legend="Plan" value={value} onValueChange={setValue}>
        <PlanRadios />
      </RadioGroup>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <Field invalid>
      <RadioGroup name="notify" legend="Notifications">
        <Radio value="all" label="All" />
        <Radio value="mentions" label="Mentions only" />
        <Radio value="none" label="None" />
      </RadioGroup>
      <FieldError>Pick a notification level</FieldError>
    </Field>
  ),
};

export const NativeForm: Story = {
  render: function NativeFormRadio() {
    const [submitted, setSubmitted] = useState('');
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(String(data.get('billing') ?? ''));
        }}
      >
        <Stack gap="md">
          <RadioGroup name="billing" legend="Billing">
            <Radio value="monthly" label="Monthly" />
            <Radio value="yearly" label="Yearly" />
          </RadioGroup>
          <Text>
            Same <code>name</code> groups without JS. Arrow keys move selection.
          </Text>
          <Button type="submit">Submit</Button>
          {submitted ? <Text>Submitted: {submitted}</Text> : null}
        </Stack>
      </form>
    );
  },
};

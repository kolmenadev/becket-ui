import type { Meta, StoryObj } from '@storybook/react';
import { steps as stepsRecipe } from '@becket-ui/tokens/recipes';

import { Stack } from './Stack';
import { Step, Steps, type StepsProps } from './Steps';

export default {
  title: 'Navigation/Steps',
  component: Steps,
  args: { orientation: 'horizontal', size: 'md' },
  argTypes: {
    orientation: { control: { type: 'select' }, options: stepsRecipe.variantMap.orientation },
    size: { control: { type: 'select' }, options: stepsRecipe.variantMap.size },
  },
  parameters: { controls: { include: ['orientation', 'size'] } },
} satisfies Meta<typeof Steps>;

type Story = StoryObj<StepsProps>;

export const Horizontal: Story = {
  render: (args) => (
    <Steps {...args} aria-label="Sign-up progress">
      <Step status="complete" title="Account" />
      <Step status="current" title="Profile" />
      <Step status="upcoming" title="Done" />
    </Steps>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <Steps {...args} orientation="vertical" aria-label="Sign-up progress">
      <Step status="complete" title="Account" />
      <Step status="current" title="Profile" />
      <Step status="upcoming" title="Done" />
    </Steps>
  ),
};

export const WithDescriptions: Story = {
  render: (args) => (
    <Steps {...args} aria-label="Release progress">
      <Step status="complete" title="Build" description="Packages compiled" />
      <Step status="current" title="Review" description="Waiting on two approvals" />
      <Step status="upcoming" title="Publish" description="npm and GitHub Releases" />
    </Steps>
  ),
};

export const AllComplete: Story = {
  render: (args) => (
    <Steps {...args} aria-label="Sign-up progress">
      <Step status="complete" title="Account" />
      <Step status="complete" title="Profile" />
      <Step status="complete" title="Done" />
    </Steps>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="lg">
      {stepsRecipe.variantMap.size.map((size) => (
        <Steps key={size} {...args} size={size} aria-label={`Sign-up progress, ${size}`}>
          <Step status="complete" title="Account" />
          <Step status="current" title="Profile" />
          <Step status="upcoming" title="Done" />
        </Steps>
      ))}
    </Stack>
  ),
};

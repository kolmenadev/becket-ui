import type { Meta, StoryObj } from '@storybook/react';
import { spinner as spinnerRecipe } from '@becket-ui/tokens/recipes';
import { HStack } from './Stack';
import { Spinner, type SpinnerProps } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  args: { size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: spinnerRecipe.variantMap.size },
  },
  parameters: {
    controls: { include: ['size'] },
  },
};
export default meta;

type Story = StoryObj<SpinnerProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="md">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </HStack>
  ),
};

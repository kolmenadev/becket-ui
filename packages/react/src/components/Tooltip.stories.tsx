import type { Meta, StoryObj } from '@storybook/react';
import { Button, HStack, Tooltip } from '@maverick/react';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    delayMs: { control: { type: 'number' } },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Short glossary hint.',
    placement: 'top',
    delayMs: 200,
  },
  render: (args) => (
    <HStack gap="md" align="center" style={{ padding: '4rem' }}>
      <Tooltip {...args}>
        <Button size="sm" visual="outline">
          Hover me
        </Button>
      </Tooltip>
    </HStack>
  ),
};

export const Placements: Story = {
  render: () => (
    <HStack gap="lg" align="center" style={{ padding: '5rem', flexWrap: 'wrap' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip key={placement} content={`Placement: ${placement}`} placement={placement}>
          <Button size="sm" visual="neutral">
            {placement}
          </Button>
        </Tooltip>
      ))}
    </HStack>
  ),
};

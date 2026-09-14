import type { Meta, StoryObj } from '@storybook/react-vite';

import { BREAKPOINT_OPTIONS, knobs } from '../helpers/storybookControls';
import { Hide, type HideProps } from './Hide';
import { SimpleGrid } from './SimpleGrid';
import { Text } from './Text';

const meta: Meta<typeof Hide> = {
  title: 'Layout/Hide',
  component: Hide,
  argTypes: {
    below: { control: { type: 'select' }, options: [...BREAKPOINT_OPTIONS] },
    from: { control: { type: 'select' }, options: [...BREAKPOINT_OPTIONS] },
    asContents: { control: { type: 'boolean' } },
  },
  args: { asContents: true },
  parameters: knobs(['below', 'from', 'asContents']),
};

export default meta;
type Story = StoryObj<HideProps>;

export const Default: Story = {
  args: { below: 'desktop' },
  render: (args: HideProps) => (
    <Hide {...args}>
      <Text>Hidden below the selected breakpoint (desktop = lg).</Text>
    </Hide>
  ),
};

export const HideBelowDesktop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the viewport toolbar. Below `lg` (desktop) only the mobile-only line should show; from desktop up only the first line should show.',
      },
    },
    controls: { disable: true },
  },
  render: () => (
    <SimpleGrid columns={{ mobile: 1, desktop: 2 }} gap="md">
      <Hide below="desktop">
        <Text>Visible from desktop up (hidden on mobile)</Text>
      </Hide>
      <Hide from="desktop">
        <Text>Mobile-only (hidden from desktop up)</Text>
      </Hide>
    </SimpleGrid>
  ),
};

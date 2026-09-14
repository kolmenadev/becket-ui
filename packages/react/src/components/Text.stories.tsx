import type { Meta, StoryObj } from '@storybook/react';
import { knobs } from '../helpers/storybookControls';
import { Text, type TextProps } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Typography/Text',
  component: Text,
  argTypes: {
    as: { control: { type: 'select' }, options: ['p', 'span', 'div', 'strong', 'em', 'label'] },
    fontSize: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    fontWeight: { control: { type: 'select' }, options: ['thin', 'light', 'normal', 'medium', 'semibold', 'bold'] },
    color: { control: { type: 'text' } },
    lineHeight: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    truncate: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
  },
  parameters: knobs(['as', 'fontSize', 'fontWeight', 'color', 'lineHeight', 'truncate', 'children']),
};
export default meta;

type Story = StoryObj<TextProps>;

export const Default: Story = {
  args: { children: 'The quick brown fox jumps over the lazy dog.', as: 'p' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Text fontSize="xs">xs size</Text>
      <Text fontSize="sm">sm size</Text>
      <Text fontSize="md">md size</Text>
      <Text fontSize="lg">lg size</Text>
      <Text fontSize="xl">xl size</Text>
      <Text fontSize="2xl">2xl size</Text>
    </div>
  ),
};

export const Truncate: Story = {
  args: {
    truncate: true,
    maxW: '300px',
    children:
      'This is a very long line of text that will demonstrate truncation behavior when the truncate prop is enabled and the container has a constrained width.',
  },
  render: (args: TextProps) => (
    <Text {...args}>
      {args.children}
    </Text>
  ),
};



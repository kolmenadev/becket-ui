import type { Meta, StoryObj } from '@storybook/react';
import { Stack, HStack, VStack } from './Stack';

const meta = {
  title: 'Components/Stack',
  component: Stack,
  argTypes: {
    direction: { control: { type: 'select' }, options: ['row', 'column'] },
    gap: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl', '2xs'] },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
} satisfies Meta<typeof Stack>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { direction: 'column', gap: 'sm', align: 'start', justify: 'center' },
  render: (args: Story['args']) => (
    <Stack {...args}>
      <div style={{ background: '#e0e0e0', padding: 8, width: '65px', height: '40px' }}>Item 1</div>
      <div style={{ background: '#bdbdbd', padding: 8, width: '65px', height: '40px' }}>Item 2</div>
      <div style={{ background: '#9e9e9e', padding: 8, width: '65px', height: '40px' }}>Item 3</div>
    </Stack>
  ),
};

export const Horizontal: Story = {
  args: { gap: 'md', align: 'center', justify: 'center' },
  argTypes: { direction: { table: { disable: true } } },
  render: (args: Story['args']) => (
    <HStack {...args} style={{ border: '1px solid #eee', padding: 16, height: 200, width: 500 }}>
      <div style={{ background: '#e0e0e0', padding: 8, width: '65px', height: '40px' }}>Item 1</div>
      <div style={{ background: '#bdbdbd', padding: 8, width: '65px', height: '40px' }}>Item 2</div>
      <div style={{ background: '#9e9e9e', padding: 8, width: '65px', height: '40px' }}>Item 3</div>
    </HStack>
  ),
};

export const Vertical: Story = {
  args: { gap: 'md', align: 'center', justify: 'center' },
  argTypes: { direction: { table: { disable: true } } },
  render: (args: Story['args']) => (
    <VStack {...args} style={{ border: '1px solid #eee', padding: 16, height: 300, width: 200 }}>
      <div style={{ background: '#e0e0e0', padding: 8, width: '65px', height: '40px' }}>Item 1</div>
      <div style={{ background: '#bdbdbd', padding: 8, width: '65px', height: '40px' }}>Item 2</div>
      <div style={{ background: '#9e9e9e', padding: 8, width: '65px', height: '40px' }}>Item 3</div>
    </VStack>
  ),
};

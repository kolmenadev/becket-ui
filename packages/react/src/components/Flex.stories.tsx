import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from './Flex';

const meta = {
  title: 'Components/Flex',
  component: Flex,
  argTypes: {
    direction: { control: { type: 'select' }, options: ['row', 'column', 'row-reverse', 'column-reverse'] },
    gap: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl', '2xs'] },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: {
      control: { type: 'select' },
      options: ['wrap', 'nowrap', 'wrap-reverse'],
    },
    inline: { control: { type: 'boolean' } },
  },
} satisfies Meta<typeof Flex>;
export default meta;

type Story = StoryObj<typeof meta>;

const boxStyle = {
  background: '#e0e0e0',
  padding: 8,
  minWidth: 65,
  height: 40,
};

export const Default: Story = {
  args: { direction: 'row', gap: 'md', align: 'start', justify: 'start' },
  render: (args: Story['args']) => (
    <Flex {...args} style={{ border: '1px solid #eee', padding: 16 }}>
      <div style={{ ...boxStyle, background: '#e0e0e0' }}>Item 1</div>
      <div style={{ ...boxStyle, background: '#bdbdbd' }}>Item 2</div>
      <div style={{ ...boxStyle, background: '#9e9e9e' }}>Item 3</div>
    </Flex>
  ),
};

export const Direction: Story = {
  args: { gap: 'md' },
  render: (args: Story['args']) => (
    <Flex direction="column" gap="lg">
      <Flex {...args} direction="row" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={boxStyle}>row 1</div>
        <div style={boxStyle}>row 2</div>
        <div style={boxStyle}>row 3</div>
      </Flex>
      <Flex {...args} direction="column" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={boxStyle}>column 1</div>
        <div style={boxStyle}>column 2</div>
        <div style={boxStyle}>column 3</div>
      </Flex>
    </Flex>
  ),
};

export const Align: Story = {
  args: { gap: 'md', align: 'center' },
  render: (args: Story['args']) => (
    <Flex {...args} style={{ border: '1px solid #eee', padding: 16, height: 120 }}>
      <div style={{ ...boxStyle, height: 32 }}>4px</div>
      <div style={{ ...boxStyle, height: 64 }}>8px</div>
      <div style={{ ...boxStyle, height: 80 }}>10px</div>
    </Flex>
  ),
};

export const Justify: Story = {
  args: { gap: 'md', justify: 'center' },
  render: (args: Story['args']) => (
    <Flex direction="column" gap="lg">
      <Flex {...args} justify="start" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={{ ...boxStyle, width: 120 }}>start</div>
      </Flex>
      <Flex {...args} justify="center" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={{ ...boxStyle, width: 120 }}>center</div>
      </Flex>
      <Flex {...args} justify="end" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={{ ...boxStyle, width: 120 }}>end</div>
      </Flex>
      <Flex {...args} justify="between" style={{ border: '1px solid #eee', padding: 16 }}>
        <div style={{ ...boxStyle, width: 120 }}>between</div>
        <div style={{ ...boxStyle, width: 120 }}>Item 2</div>
      </Flex>
    </Flex>
  ),
};

export const Wrap: Story = {
  args: { gap: 'md', wrap: 'wrap' },
  render: (args: Story['args']) => (
    <Flex {...args} style={{ border: '1px solid #eee', padding: 16, maxWidth: 400 }}>
      <div style={{ ...boxStyle, width: 180 }}>Box 1</div>
      <div style={{ ...boxStyle, width: 180 }}>Box 2</div>
      <div style={{ ...boxStyle, width: 180 }}>Box 3</div>
    </Flex>
  ),
};

export const Inline: Story = {
  args: { gap: 'sm', inline: true },
  render: (args: Story['args']) => (
    <div>
      <Flex {...args} style={{ border: '1px solid #ccc', padding: 8 }}>
        <span>Inline</span>
        <span>Flex</span>
        <span>1</span>
      </Flex>
      <Flex {...args} style={{ border: '1px solid #ccc', padding: 8 }}>
        <span>Inline</span>
        <span>Flex</span>
        <span>2</span>
      </Flex>
    </div>
  ),
};

export const Gaps: Story = {
  render: () => (
    <Flex direction="column" gap="lg">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
        <Flex key={gap} gap={gap} style={{ border: '1px solid #eee', padding: 16 }} align="center">
          <span style={{ width: 40, fontSize: 12 }}>{gap}</span>
          <div style={boxStyle}>Item 1</div>
          <div style={boxStyle}>Item 2</div>
          <div style={boxStyle}>Item 3</div>
        </Flex>
      ))}
    </Flex>
  ),
};

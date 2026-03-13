import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@maverick/tokens';
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

const boxClass200 = css({ bg: 'neutral.200', p: 2, w: 21, h: 8 });
const boxClass300 = css({ bg: 'neutral.300', p: 2, w: 21, h: 8 });
const boxClass400 = css({ bg: 'neutral.400', p: 2, w: 21, h: 8 });

export const Basic: Story = {
  args: { direction: 'column', gap: 'sm', align: 'start', justify: 'center' },
  render: (args: Story['args']) => (
    <Stack {...args}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Stack>
  ),
};

export const Horizontal: Story = {
  args: { gap: 'md', align: 'center', justify: 'center' },
  argTypes: { direction: { table: { disable: true } } },
  render: (args: Story['args']) => (
    <HStack {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', h: 34, w: 55 })}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </HStack>
  ),
};

export const Vertical: Story = {
  args: { gap: 'md', align: 'center', justify: 'center' },
  argTypes: { direction: { table: { disable: true } } },
  render: (args: Story['args']) => (
    <VStack {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', h: 34, w: 34 })}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </VStack>
  ),
};

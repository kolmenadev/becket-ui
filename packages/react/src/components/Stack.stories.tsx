import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@maverick/tokens';
import { Stack, HStack, VStack } from './Stack';

const gradientBorderOptions = ['primary', 'secondary', 'neutral'] as const;

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
    border: {
      control: { type: 'select' },
      options: gradientBorderOptions,
    },
  },
} satisfies Meta<typeof Stack>;
export default meta;

type Story = StoryObj<typeof meta>;

const boxClass200 = css({ bg: 'neutral.500', p: 2, w: 21, h: 8 });
const boxClass300 = css({ bg: 'neutral.600', p: 2, w: 21, h: 8 });
const boxClass400 = css({ bg: 'neutral.700', p: 2, w: 21, h: 8 });
const gradientContainerClass = css({ p: 'md', borderRadius: 'md' });

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

export const WithGradientBorder: Story = {
  args: { direction: 'column', gap: 'md', align: 'start', justify: 'start', border: 'primary' },
  render: (args: Story['args']) => (
    <Stack {...args} className={gradientContainerClass}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Stack>
  ),
};

export const GradientBorderVariants: Story = {
  render: () => (
    <VStack gap="md" className={css({ maxW: 55 })}>
      {gradientBorderOptions.map((border) => (
        <Stack
          key={border}
          border={border}
          gap="sm"
          className={gradientContainerClass}
        >
          <div className={boxClass200}>{border}</div>
          <div className={boxClass300}>Item 2</div>
        </Stack>
      ))}
    </VStack>
  ),
};

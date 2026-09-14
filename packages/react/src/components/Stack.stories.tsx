import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@becket-ui/tokens';
import {
  ALIGN_OPTIONS,
  GAP_OPTIONS,
  GRADIENT_BORDER_OPTIONS,
  JUSTIFY_OPTIONS,
  STACK_DIRECTION_OPTIONS,
  knobs,
} from '../helpers/storybookControls';
import { Stack, HStack, VStack, type StackProps } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  argTypes: {
    direction: { control: { type: 'select' }, options: [...STACK_DIRECTION_OPTIONS] },
    gap: {
      control: { type: 'select' },
      options: [...GAP_OPTIONS, 0, 1, 2, 3, 5, 8, 13, 21, 34],
    },
    align: { control: { type: 'select' }, options: [...ALIGN_OPTIONS] },
    justify: { control: { type: 'select' }, options: [...JUSTIFY_OPTIONS] },
    border: { control: { type: 'select' }, options: [...GRADIENT_BORDER_OPTIONS] },
    order: { control: { type: 'number', min: -5, max: 5, step: 1 } },
  },
  parameters: knobs(['direction', 'gap', 'align', 'justify', 'border', 'order']),
};
export default meta;

type Story = StoryObj<StackProps>;

const boxClass200 = css({ bg: 'neutral.500', p: 2, w: 21, h: 8 });
const boxClass300 = css({ bg: 'neutral.600', p: 2, w: 21, h: 8 });
const boxClass400 = css({ bg: 'neutral.700', p: 2, w: 21, h: 8 });
const gradientContainerClass = css({ p: 'md', borderRadius: 'md' });

export const Basic: Story = {
  args: { direction: 'column', gap: 'sm', align: 'start', justify: 'center' },
  render: (args: StackProps) => (
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
  render: (args: StackProps) => (
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
  render: (args: StackProps) => (
    <VStack {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', h: 34, w: 34 })}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </VStack>
  ),
};

export const NumericGap: Story = {
  args: { direction: 'column', gap: 3, align: 'start', justify: 'start' },
  render: (args: StackProps) => (
    <Stack {...args}>
          <div className={boxClass200}>gap=3 (0.75rem)</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Stack>
  ),
};

export const WithGradientBorder: Story = {
  args: { direction: 'column', gap: 'md', align: 'start', justify: 'start', border: 'primary' },
  render: (args: StackProps) => (
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
      {GRADIENT_BORDER_OPTIONS.map((border) => (
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

import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@becket-ui/tokens';
import {
  alignOptions,
  flexBasisOptions,
  flexDirectionOptions,
  flexWrapOptions,
  gapOptions,
  gradientBorderOptions,
  justifyOptions,
  knobs,
} from '../helpers/storybookControls';
import { demoChip, demoChipLg, demoChipMd, demoChipWide } from '../helpers/storybookDemoChip';
import { Flex, type FlexProps } from './Flex';

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  argTypes: {
    direction: { control: { type: 'select' }, options: [...flexDirectionOptions] },
    gap: { control: { type: 'select' }, options: [...gapOptions] },
    align: { control: { type: 'select' }, options: [...alignOptions] },
    justify: { control: { type: 'select' }, options: [...justifyOptions] },
    wrap: { control: { type: 'select' }, options: [...flexWrapOptions] },
    basis: { control: { type: 'select' }, options: [...flexBasisOptions] },
    grow: { control: { type: 'number', min: 0, max: 5, step: 1 } },
    shrink: { control: { type: 'number', min: 0, max: 5, step: 1 } },
    order: { control: { type: 'number', min: -5, max: 5, step: 1 } },
    border: { control: { type: 'select' }, options: [...gradientBorderOptions] },
    inline: { control: { type: 'boolean' } },
  },
  parameters: knobs([
    'direction',
    'gap',
    'align',
    'justify',
    'wrap',
    'basis',
    'grow',
    'shrink',
    'inline',
    'border',
    'order',
  ]),
};
export default meta;

type Story = StoryObj<FlexProps>;

const containerClass = css({
  border: '1px solid',
  borderColor: 'border',
  p: 'md',
});
const gradientContainerClass = css({
  p: 'md',
  borderRadius: 'md',
});

const boxClass200 = demoChip;
const boxClass300 = demoChip;
const boxClass400 = demoChip;

export const Default: Story = {
  args: { direction: 'row', gap: 'md', align: 'start', justify: 'start' },
  render: (args: FlexProps) => (
    <Flex {...args} className={containerClass}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Flex>
  ),
};

export const Direction: Story = {
  args: { direction: 'row', gap: 'md' },
  render: (args: FlexProps) => (
    <Flex {...args} className={containerClass}>
      <div className={boxClass200}>1</div>
      <div className={boxClass300}>2</div>
      <div className={boxClass400}>3</div>
    </Flex>
  ),
};

const boxClassHeights = {
  sm: demoChip,
  md: demoChipMd,
  lg: demoChipLg,
};

export const Align: Story = {
  args: { gap: 'md', align: 'center' },
  render: (args: FlexProps) => (
    <Flex {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', h: 34 })}>
      <div className={boxClassHeights.sm}>4px</div>
      <div className={boxClassHeights.md}>8px</div>
      <div className={boxClassHeights.lg}>10px</div>
    </Flex>
  ),
};

const boxClassWide = demoChipWide;

export const Justify: Story = {
  args: { gap: 'md', justify: 'center' },
  render: (args: FlexProps) => (
    <Flex {...args} className={containerClass}>
      <div className={boxClassWide}>1</div>
      <div className={boxClassWide}>2</div>
      <div className={boxClassWide}>3</div>
    </Flex>
  ),
};

const boxClassWrap = demoChipWide;

export const Wrap: Story = {
  args: { gap: 'md', wrap: 'wrap' },
  render: (args: FlexProps) => (
    <Flex {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', maxW: 34 })}>
      <div className={boxClassWrap}>Box 1</div>
      <div className={boxClassWrap}>Box 2</div>
      <div className={boxClassWrap}>Box 3</div>
    </Flex>
  ),
};

const inlineContainerClass = css({ border: '1px solid', borderColor: 'neutral.300', p: 2 });

export const Inline: Story = {
  args: { gap: 'sm', inline: true },
  render: (args: FlexProps) => (
    <div>
      <Flex {...args} className={inlineContainerClass}>
        <span>Inline</span>
        <span>Flex</span>
        <span>1</span>
      </Flex>
      <Flex {...args} className={inlineContainerClass}>
        <span>Inline</span>
        <span>Flex</span>
        <span>2</span>
      </Flex>
    </div>
  ),
};

const gapLabelClass = css({ w: 8, fontSize: 'xs' });

export const Gaps: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex direction="column" gap="lg">
      {(['xs', 'sm', 'md', 'lg', 'xl']).map((gap) => (
        <Flex key={gap} gap={gap} className={containerClass} align="center">
          <span className={gapLabelClass}>{gap}</span>
          <div className={boxClass200}>Item 1</div>
          <div className={boxClass200}>Item 2</div>
          <div className={boxClass200}>Item 3</div>
        </Flex>
      ))}
    </Flex>
  ),
};

export const WithGradientBorder: Story = {
  args: {
    direction: 'row',
    gap: 'md',
    align: 'center',
    justify: 'between',
    border: 'primary',
  },
  render: (args: FlexProps) => (
    <Flex {...args} className={gradientContainerClass}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Flex>
  ),
};

export const GradientBorderVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex direction="column" gap="md">
      {gradientBorderOptions.map((border) => (
        <Flex
          key={border}
          border={border}
          gap="md"
          align="center"
          justify="between"
          className={gradientContainerClass}
        >
          <div className={boxClass200}>{border}</div>
          <div className={boxClass300}>Item 2</div>
          <div className={boxClass400}>Item 3</div>
        </Flex>
      ))}
    </Flex>
  ),
};

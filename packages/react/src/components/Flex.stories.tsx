import type { Meta, StoryObj } from '@storybook/react';
import { css } from '@maverick/tokens';
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

const containerClass = css({
  border: '1px solid',
  borderColor: 'border',
  p: 'md',
});

const boxClass200 = css({ bg: 'neutral.200', p: 2, minW: 13, h: 8 });
const boxClass300 = css({ bg: 'neutral.300', p: 2, minW: 13, h: 8 });
const boxClass400 = css({ bg: 'neutral.400', p: 2, minW: 13, h: 8 });

export const Default: Story = {
  args: { direction: 'row', gap: 'md', align: 'start', justify: 'start' },
  render: (args: Story['args']) => (
    <Flex {...args} className={containerClass}>
      <div className={boxClass200}>Item 1</div>
      <div className={boxClass300}>Item 2</div>
      <div className={boxClass400}>Item 3</div>
    </Flex>
  ),
};

export const Direction: Story = {
  args: { gap: 'md' },
  render: (args: Story['args']) => (
    <Flex direction="column" gap="lg">
      <Flex {...args} direction="row" className={containerClass}>
        <div className={boxClass200}>row 1</div>
        <div className={boxClass200}>row 2</div>
        <div className={boxClass200}>row 3</div>
      </Flex>
      <Flex {...args} direction="column" className={containerClass}>
        <div className={boxClass200}>column 1</div>
        <div className={boxClass200}>column 2</div>
        <div className={boxClass200}>column 3</div>
      </Flex>
    </Flex>
  ),
};

const boxClassHeights = {
  sm: css({ bg: 'neutral.200', p: 2, minW: 13, h: 8 }),
  md: css({ bg: 'neutral.200', p: 2, minW: 13, h: 13 }),
  lg: css({ bg: 'neutral.200', p: 2, minW: 13, h: 21 }),
};

export const Align: Story = {
  args: { gap: 'md', align: 'center' },
  render: (args: Story['args']) => (
    <Flex {...args} className={css({ border: '1px solid', borderColor: 'border', p: 'md', h: 34 })}>
      <div className={boxClassHeights.sm}>4px</div>
      <div className={boxClassHeights.md}>8px</div>
      <div className={boxClassHeights.lg}>10px</div>
    </Flex>
  ),
};

const boxClassWide = css({ bg: 'neutral.200', p: 2, minW: 13, h: 8, w: 21 });

export const Justify: Story = {
  args: { gap: 'md', justify: 'center' },
  render: (args: Story['args']) => (
    <Flex direction="column" gap="lg">
      <Flex {...args} justify="start" className={containerClass}>
        <div className={boxClassWide}>start</div>
      </Flex>
      <Flex {...args} justify="center" className={containerClass}>
        <div className={boxClassWide}>center</div>
      </Flex>
      <Flex {...args} justify="end" className={containerClass}>
        <div className={boxClassWide}>end</div>
      </Flex>
      <Flex {...args} justify="between" className={containerClass}>
        <div className={boxClassWide}>between</div>
        <div className={boxClassWide}>Item 2</div>
      </Flex>
    </Flex>
  ),
};

const boxClassWrap = css({ bg: 'neutral.200', p: 2, h: 8, w: 21 });

export const Wrap: Story = {
  args: { gap: 'md', wrap: 'wrap' },
  render: (args: Story['args']) => (
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
  render: (args: Story['args']) => (
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
  render: () => (
    <Flex direction="column" gap="lg">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
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

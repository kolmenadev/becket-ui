import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardBody, CardTitle } from './Card';
import { SimpleGrid, type SimpleGridProps } from './SimpleGrid';
import { GAP_OPTIONS, knobs } from '../helpers/storybookControls';

const meta: Meta<typeof SimpleGrid> = {
  title: 'Layout/SimpleGrid',
  component: SimpleGrid,
  args: { columns: 3, gap: 'md' },
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6, step: 1 } },
    gap: { control: { type: 'select' }, options: [...GAP_OPTIONS] },
    minChildWidth: { control: { type: 'text' } },
    rowGap: { control: { type: 'select' }, options: [...GAP_OPTIONS] },
    columnGap: { control: { type: 'select' }, options: [...GAP_OPTIONS] },
  },
  parameters: knobs(['columns', 'gap', 'minChildWidth', 'rowGap', 'columnGap']),
};
export default meta;

type Story = StoryObj<SimpleGridProps>;

function DemoCard({ label }: { label: string }) {
  return (
    <Card size="sm" visual="outline" fullWidth>
      <CardBody>
        <CardTitle style={{ fontSize: '0.875rem' }}>{label}</CardTitle>
      </CardBody>
    </Card>
  );
}

export const FixedColumns: Story = {
  render: (args: SimpleGridProps) => (
    <SimpleGrid {...args}>
      <DemoCard label="One" />
      <DemoCard label="Two" />
      <DemoCard label="Three" />
      <DemoCard label="Four" />
    </SimpleGrid>
  ),
};

export const ResponsiveColumns: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SimpleGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap={{ mobile: 'sm', desktop: 'md' }}>
      <DemoCard label="One" />
      <DemoCard label="Two" />
      <DemoCard label="Three" />
      <DemoCard label="Four" />
    </SimpleGrid>
  ),
};

export const AutoResponsive: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SimpleGrid minChildWidth="10rem" gap="md">
      <DemoCard label="Alpha" />
      <DemoCard label="Beta" />
      <DemoCard label="Gamma" />
      <DemoCard label="Delta" />
    </SimpleGrid>
  ),
};

export const GapVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <SimpleGrid minChildWidth="8rem" gap="lg" rowGap="sm">
      <DemoCard label="Row gap sm" />
      <DemoCard label="Column gap lg" />
      <DemoCard label="Wraps cleanly" />
    </SimpleGrid>
  ),
};

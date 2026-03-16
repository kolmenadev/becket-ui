import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';
import { heading as headingRecipe } from '@maverick/tokens/recipes';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: headingRecipe.variantMap.size,
    },
    withGradient: { control: { type: 'boolean' } },
    as: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: { children: "I'm a Heading", size: 'xl' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading size="sm">Heading (sm)</Heading>
      <Heading size="md">Heading (md)</Heading>
      <Heading size="lg">Heading (lg)</Heading>
      <Heading size="xl">Heading (xl)</Heading>
      <Heading size="2xl">Heading (2xl)</Heading>
      <Heading size="3xl">Heading (3xl)</Heading>
      <Heading size="4xl">Heading (4xl)</Heading>
      <Heading size="5xl">Heading (5xl)</Heading>
      <Heading size="6xl">Heading (6xl)</Heading>
    </div>
  ),
};

export const WithGradient: Story = {
  args: {
    children: 'Heading with gradient',
    size: '2xl',
    withGradient: true,
  },
};

export const AsElement: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading as="h1">Level 1</Heading>
      <Heading as="h2">Level 2</Heading>
      <Heading as="h3">Level 3</Heading>
      <Heading as="h4">Level 4</Heading>
      <Heading as="h5">Level 5</Heading>
      <Heading as="h6">Level 6</Heading>
    </div>
  ),
};

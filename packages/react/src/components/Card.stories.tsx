import type { Meta, StoryObj } from '@storybook/react';
import { card as cardRecipe } from '@becket-ui/tokens/recipes';
import { SimpleGrid } from './SimpleGrid';
import { Stack } from './Stack';
import { Text } from './Text';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps,
} from './Card';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  args: {
    size: 'md',
    visual: 'subtle',
    fullWidth: false,
  },
  argTypes: {
    size: { control: { type: 'select' }, options: cardRecipe.variantMap.size },
    visual: {
      control: { type: 'select' },
      options: cardRecipe.variantMap.visual,
      description:
        'Surface treatment: outline (transparent), subtle (raised fill), elevated (fill + shadow).',
    },
    fullWidth: { control: { type: 'boolean' } },
  },
  parameters: {
    controls: { include: ['size', 'visual', 'fullWidth'] },
  },
};
export default meta;

type Story = StoryObj<CardProps>;

export const Default: Story = {
  render: (args: CardProps) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Panel title</CardTitle>
      </CardHeader>
      <CardBody>
        <Text>Card body content with Becket spacing and borders.</Text>
      </CardBody>
    </Card>
  ),
};

export const Anatomy: Story = {
  render: (args: CardProps) => (
    <Card {...args} visual={args.visual ?? 'elevated'}>
      <CardHeader>
        <Stack gap="1">
          <CardTitle>Signal breakdown</CardTitle>
          <CardDescription>Live edge components from the market stream.</CardDescription>
        </Stack>
      </CardHeader>
      <CardBody>
        <Text>Body slot for tables, charts, and domain widgets.</Text>
      </CardBody>
      <CardFooter>
        <CardDescription>Updated via WebSocket</CardDescription>
      </CardFooter>
    </Card>
  ),
  args: { visual: 'elevated' },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Card size="sm">
        <CardTitle>Small</CardTitle>
        <CardBody>
          <Text>Compact padding</Text>
        </CardBody>
      </Card>
      <Card size="md">
        <CardTitle>Medium</CardTitle>
        <CardBody>
          <Text>Default dashboard padding</Text>
        </CardBody>
      </Card>
      <Card size="lg">
        <CardTitle>Large</CardTitle>
        <CardBody>
          <Text>Roomier layout</Text>
        </CardBody>
      </Card>
    </Stack>
  ),
};

export const Visuals: Story = {
  render: () => (
    <Stack gap="md">
      <Card visual="outline">
        <CardTitle>Outline</CardTitle>
        <CardBody>
          <Text>Transparent surface, border only.</Text>
        </CardBody>
      </Card>
      <Card visual="subtle">
        <CardTitle>Subtle</CardTitle>
        <CardBody>
          <Text>Filled surface a step above the page.</Text>
        </CardBody>
      </Card>
      <Card visual="elevated">
        <CardTitle>Elevated</CardTitle>
        <CardBody>
          <Text>Filled surface plus shadow.</Text>
        </CardBody>
      </Card>
    </Stack>
  ),
};

export const WithGrid: Story = {
  render: () => (
    <Card fullWidth>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardBody>
        <SimpleGrid minChildWidth="10rem" gap="md">
          {['Countdown', 'WebSocket', 'Leading side', 'Edge score'].map((label) => (
            <Card key={label} size="sm" visual="outline" fullWidth>
              <CardBody>
                <Text style={{ opacity: 0.72, fontSize: '0.875rem' }}>{label}</Text>
                <Text style={{ fontWeight: 600 }}>—</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  ),
};

export const HeaderAction: Story = {
  render: (args: CardProps) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Order book</CardTitle>
        <CardDescription>UP · DOWN</CardDescription>
      </CardHeader>
      <CardBody>
        <Text>Domain content stays in the app; Card supplies layout chrome.</Text>
      </CardBody>
    </Card>
  ),
};

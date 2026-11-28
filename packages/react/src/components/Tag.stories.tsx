import type { Meta, StoryObj } from '@storybook/react';
import { tag as tagRecipe } from '@becket-ui/tokens/recipes';
import { defineBecketTheme } from '@becket-ui/tokens/theme';
import { Box } from './Box';
import { HStack, Stack, VStack } from './Stack';
import { Text } from './Text';
import { Tag, type TagProps } from './Tag';

const tagDensityCss = defineBecketTheme({
  density: { tag: { md: { px: '0.35rem', py: '0.05rem' } } },
});

const meta: Meta<typeof Tag> = {
  title: 'Data Display/Tag',
  component: Tag,
  args: {
    children: 'Tag',
    visual: 'neutral',
    size: 'md',
    borderRadius: 'full',
    withGradient: false,
  },
  argTypes: {
    visual: { control: { type: 'select' }, options: tagRecipe.variantMap.visual },
    size: { control: { type: 'select' }, options: tagRecipe.variantMap.size },
    borderRadius: {
      control: { type: 'select' },
      options: tagRecipe.variantMap.borderRadius,
    },
    withGradient: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
  },
  parameters: {
    controls: {
      include: ['visual', 'size', 'borderRadius', 'withGradient', 'children'],
    },
  },
};
export default meta;

type Story = StoryObj<TagProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="sm" align="center">
      <Tag size="sm">sm</Tag>
      <Tag size="md">md</Tag>
      <Tag size="lg">lg</Tag>
    </HStack>
  ),
};

export const Visuals: Story = {
  render: () => (
    <HStack gap="sm" align="center" style={{ flexWrap: 'wrap' }}>
      <Tag visual="primary">Primary</Tag>
      <Tag visual="secondary">Secondary</Tag>
      <Tag visual="neutral">Neutral</Tag>
      <Tag visual="outline">Outline</Tag>
      <Tag visual="success">Success</Tag>
      <Tag visual="warning">Warning</Tag>
      <Tag visual="danger">Danger</Tag>
      <Tag visual="info">Info</Tag>
    </HStack>
  ),
};

export const Status: Story = {
  render: () => (
    <HStack gap="sm" align="center" style={{ flexWrap: 'wrap' }}>
      <Tag visual="success">Paid</Tag>
      <Tag visual="warning">Pending</Tag>
      <Tag visual="danger">Failed</Tag>
      <Tag visual="info">Draft</Tag>
    </HStack>
  ),
};

// The second panel sets data-theme="light" on itself, so a dark page shows both themes at once.
export const StatusBothThemes: Story = {
  render: () => (
    <HStack gap="md" align="stretch" style={{ flexWrap: 'wrap' }}>
      {['Page theme', 'Light theme'].map((name) => (
        <Box
          key={name}
          data-theme={name === 'Light theme' ? 'light' : undefined}
          background="background"
          padding="md"
          radius="md"
        >
          <VStack gap="sm">
            <Text fontSize="xs" color="muted">
              {name}
            </Text>
            <HStack gap="sm" align="center">
              {tagRecipe.variantMap.visual.map((visual) => (
                <Tag key={visual} visual={visual}>
                  {visual}
                </Tag>
              ))}
            </HStack>
          </VStack>
        </Box>
      ))}
    </HStack>
  ),
};

export const WithGradient: Story = {
  render: () => (
    <HStack gap="sm" align="center" style={{ flexWrap: 'wrap' }}>
      <Tag visual="primary" withGradient>
        Primary
      </Tag>
      <Tag visual="outline" withGradient>
        Outline
      </Tag>
    </HStack>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <Tag
      customColors={{
        background: 'color-mix(in srgb, #6366f1 24%, transparent)',
        color: '#c7d2fe',
        border: 'color-mix(in srgb, #6366f1 40%, transparent)',
      }}
    >
      Custom
    </Tag>
  ),
};

export const MetadataRow: Story = {
  render: () => (
    <HStack gap="sm" align="center">
      <Tag>Docs</Tag>
      <Tag>v1</Tag>
    </HStack>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Stack gap="sm" style={{ maxWidth: '6rem' }}>
      <Tag>Very-long-label-that-truncates</Tag>
    </Stack>
  ),
};

export const DensityOverride: Story = {
  render: (args) => (
    <>
      <style>{tagDensityCss}</style>
      <Stack gap="md" align="start">
        <HStack gap="sm">
          <Tag {...args}>Dense md</Tag>
          <Tag {...args} size="sm">
            sm
          </Tag>
        </HStack>
      </Stack>
    </>
  ),
};

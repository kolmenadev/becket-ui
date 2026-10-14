import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_LANDSCAPE } from '../helpers/storybookImages';
import { AspectRatio, type AspectRatioProps } from './AspectRatio';
import { Image } from './Image';
import { SimpleGrid } from './SimpleGrid';
import { VStack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof AspectRatio> = { title: 'Layout/AspectRatio', component: AspectRatio };
export default meta;

type Story = StoryObj<AspectRatioProps>;

export const Default: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} style={{ maxWidth: 'var(--beckui--sizes-md)' }}>
      <Image src={SAMPLE_LANDSCAPE} alt="Mountains at sunset" radius="md" />
    </AspectRatio>
  ),
};

export const Ratios: Story = {
  render: () => (
    <SimpleGrid columns={3} gap="md">
      {[
        ['1:1', 1],
        ['4:3', 4 / 3],
        ['16:9', 16 / 9],
      ].map(([label, ratio]) => (
        <VStack key={label as string} gap="xs">
          <AspectRatio ratio={ratio as number}>
            <Image src={SAMPLE_LANDSCAPE} alt={`${label} crop`} radius="md" />
          </AspectRatio>
          <Text fontSize="xs" color="muted">
            {label}
          </Text>
        </VStack>
      ))}
    </SimpleGrid>
  ),
};

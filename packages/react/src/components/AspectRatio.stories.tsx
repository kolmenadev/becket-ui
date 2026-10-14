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
    <AspectRatio ratio="16:9" style={{ maxWidth: 'var(--beckui--sizes-md)' }}>
      <Image src={SAMPLE_LANDSCAPE} alt="Mountains at sunset" radius="md" />
    </AspectRatio>
  ),
};

export const Ratios: Story = {
  render: () => (
    <SimpleGrid columns={3} gap="md">
      {[
        ['1:1', 'Square'],
        ['3:2', 'Photo'],
        ['8:5', 'Screen'],
        ['13:8', 'Golden'],
        ['16:9', 'Video'],
        ['5:8', 'Portrait'],
      ].map(([ratio, label]) => (
        <VStack key={ratio} gap="xs">
          <AspectRatio ratio={ratio as AspectRatioProps['ratio']}>
            <Image src={SAMPLE_LANDSCAPE} alt={`${label} crop`} radius="md" />
          </AspectRatio>
          <Text fontSize="xs" color="muted">
            {ratio} {label.toLowerCase()}
          </Text>
        </VStack>
      ))}
    </SimpleGrid>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { image as imageRecipe } from '@becket-ui/tokens/recipes';
import { SAMPLE_LANDSCAPE } from '../helpers/storybookImages';
import { Image, type ImageProps } from './Image';
import { SimpleGrid } from './SimpleGrid';

const meta: Meta<typeof Image> = {
  title: 'Data Display/Image',
  component: Image,
  args: { radius: 'md', fit: 'cover' },
  argTypes: {
    radius: { control: { type: 'select' }, options: imageRecipe.variantMap.radius },
    fit: { control: { type: 'select' }, options: imageRecipe.variantMap.fit },
  },
  parameters: { controls: { include: ['radius', 'fit'] } },
};
export default meta;

type Story = StoryObj<ImageProps>;

export const Default: Story = {
  render: (args) => <Image {...args} src={SAMPLE_LANDSCAPE} alt="Mountains at sunset" width={320} />,
};

export const Radii: Story = {
  render: () => (
    <SimpleGrid columns={3} gap="md">
      {(['none', 'md', 'xl'] as const).map((radius) => (
        <Image key={radius} src={SAMPLE_LANDSCAPE} alt={`Radius ${radius}`} radius={radius} />
      ))}
    </SimpleGrid>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { SAMPLE_LANDSCAPE } from '../helpers/storybookImages';
import { Figure, type FigureProps } from './Figure';
import { Image } from './Image';

const meta: Meta<typeof Figure> = { title: 'Data Display/Figure', component: Figure };
export default meta;

type Story = StoryObj<FigureProps>;

export const Default: Story = {
  render: () => (
    <Figure caption="Sunset over the range, March 2026." style={{ maxWidth: 'var(--beckui--sizes-md)' }}>
      <Image src={SAMPLE_LANDSCAPE} alt="Mountains at sunset" radius="md" />
    </Figure>
  ),
};

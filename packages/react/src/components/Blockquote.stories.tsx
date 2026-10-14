import type { Meta, StoryObj } from '@storybook/react';
import { Blockquote, BlockquoteCaption, type BlockquoteProps } from './Blockquote';

const meta: Meta<typeof Blockquote> = { title: 'Typography/Blockquote', component: Blockquote };
export default meta;

type Story = StoryObj<BlockquoteProps>;

export const Default: Story = {
  render: () => (
    <Blockquote>
      <p>Every visual decision is a prop with a token value.</p>
    </Blockquote>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Blockquote cite="https://github.com/kolmenadev/becket-ui">
      <p>We shipped the marketing site without a single third-party UI library.</p>
      <BlockquoteCaption>Becket team, release notes</BlockquoteCaption>
    </Blockquote>
  ),
};

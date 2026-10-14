import type { Meta, StoryObj } from '@storybook/react';
import { SkipLink, type SkipLinkProps } from './SkipLink';
import { Text } from './Text';

const meta: Meta<typeof SkipLink> = { title: 'Accessibility/SkipLink', component: SkipLink };
export default meta;

type Story = StoryObj<SkipLinkProps>;

/** Hidden until focused: press Tab in this story to see it. */
export const Default: Story = {
  render: () => (
    <>
      <SkipLink href="#story-main" />
      <Text color="muted">Press Tab: the skip link appears at the top left.</Text>
      <main id="story-main" />
    </>
  ),
};

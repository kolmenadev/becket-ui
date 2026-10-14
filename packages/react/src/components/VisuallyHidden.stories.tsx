import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { CloseIcon } from './Glyphs';
import { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = { title: 'Accessibility/VisuallyHidden', component: VisuallyHidden };
export default meta;

type Story = StoryObj<VisuallyHiddenProps>;

/** The button shows only an icon; screen readers hear "Close dialog". */
export const Default: Story = {
  render: () => (
    <Button visual="neutral">
      <CloseIcon />
      <VisuallyHidden>Close dialog</VisuallyHidden>
    </Button>
  ),
};

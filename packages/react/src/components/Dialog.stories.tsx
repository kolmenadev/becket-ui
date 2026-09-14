import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './Button';
import { Text } from './Text';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogProps,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  parameters: {
    controls: { disable: true },
  },
};
export default meta;

type Story = StoryObj<DialogProps>;

export const Default: Story = {
  render: function DialogDemo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button visual="primary" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Text>Native dialog. Escape and backdrop click close it. Focus returns to the opener.</Text>
          </DialogBody>
          <DialogFooter>
            <Button visual="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button visual="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './Button';
import { Text } from './Text';
import { Dialog, type DialogProps } from './Dialog';

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
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Confirm"
          footer={
            <>
              <Button visual="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button visual="primary" onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <Text>
            Native dialog. Escape and backdrop click close it. Focus moves to Cancel, not Close.
          </Text>
        </Dialog>
      </>
    );
  },
};

export const Alert: Story = {
  render: function AlertDialogDemo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button visual="primary" onClick={() => setOpen(true)}>
          Delete
        </Button>
        <Dialog
          role="alertdialog"
          open={open}
          onOpenChange={setOpen}
          title="Delete item?"
          footer={
            <>
              <Button visual="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button visual="primary" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          <Text>This cannot be undone. Backdrop click does not dismiss an alertdialog.</Text>
        </Dialog>
      </>
    );
  },
};

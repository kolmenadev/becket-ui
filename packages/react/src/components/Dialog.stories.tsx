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

/**
 * Windows contrast themes drop the shadow ring: Tab here and the focus outline must still show.
 * No footer, so focus starts on the dialog and the first Tab reaches Close.
 */
export const ForcedColors: Story = {
  render: () => (
    <Dialog defaultOpen title="Confirm">
      <Text>Close keeps a visible focus outline in a contrast theme.</Text>
    </Dialog>
  ),
  parameters: { forcedColors: true },
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

/** Starts open so catalogs and design tools show the panel, not only the trigger. */
export const Open: Story = {
  render: function OpenDialogDemo() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button visual="primary" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Invite teammate"
          footer={
            <>
              <Button visual="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button visual="primary" onClick={() => setOpen(false)}>
                Send invite
              </Button>
            </>
          }
        >
          <Text>They get an email with a link to join this workspace.</Text>
        </Dialog>
      </>
    );
  },
};

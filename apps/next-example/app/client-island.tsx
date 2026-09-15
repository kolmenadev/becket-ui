'use client';

import { useState } from 'react';
import { Button, Dialog, Stack, Switch, Text } from '@becket-ui/react';

export function ClientIsland() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Stack gap="md" align="start">
      <Text>Client island (Switch + Dialog)</Text>
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label="Demo switch"
      />
      <Button type="button" visual="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm"
        footer={
          <>
            <Button type="button" visual="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" visual="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <Text>Native dialog. Escape and backdrop click close it.</Text>
      </Dialog>
    </Stack>
  );
}

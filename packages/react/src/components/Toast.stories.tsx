import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';
import { HStack } from './Stack';
import { ToastProvider, useToast, type ToastProviderProps } from './Toast';

// style-check keep: useToast needs the provider above it, so it runs in a child component.
function ToastButtons() {
  const toast = useToast();
  return (
    <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
      <Button
        size="sm"
        onClick={() => toast.show({ status: 'success', title: 'Saved', description: 'Your changes are live.' })}
      >
        Success
      </Button>
      <Button
        size="sm"
        onClick={() =>
          toast.show({ status: 'info', title: 'Export started', description: 'We will email you the file.' })
        }
      >
        Info
      </Button>
      <Button
        size="sm"
        onClick={() =>
          toast.show({
            status: 'warning',
            title: 'Item archived',
            action: (
              <Button size="sm" visual="neutral">
                Undo
              </Button>
            ),
          })
        }
      >
        Warning with action
      </Button>
      <Button
        size="sm"
        onClick={() =>
          toast.show({
            status: 'danger',
            title: 'Upload failed',
            description: 'The document is larger than 10 MB.',
          })
        }
      >
        Danger (stays)
      </Button>
    </HStack>
  );
}

export default {
  title: 'Feedback/Toast',
  component: ToastProvider,
  args: { duration: 5000, label: 'Notifications' },
  argTypes: {
    duration: { control: { type: 'number' } },
    label: { control: { type: 'text' } },
  },
  parameters: { controls: { include: ['duration', 'label'] } },
} satisfies Meta<typeof ToastProvider>;

// Toasts pause while the pointer or focus is on them; `danger` ones stay until dismissed.
export const Default: StoryObj<ToastProviderProps> = {
  render: (args) => (
    <ToastProvider {...args}>
      <ToastButtons />
    </ToastProvider>
  ),
};

// style-check keep: useToast needs the provider above it, so it runs in a child component.
function ShowOnMount() {
  const toast = useToast();
  // style-check keep: shows the toasts once after mount, as if they had just arrived.
  useEffect(() => {
    toast.show({ id: 'saved', status: 'success', title: 'Saved', duration: null });
    toast.show({
      id: 'sync',
      status: 'info',
      title: 'Sync paused',
      description: 'You are offline. Changes sync when you reconnect.',
      duration: null,
    });
    toast.show({ id: 'failed', status: 'danger', title: 'Upload failed', description: 'Try again.' });
  }, [toast]);
  return null;
}

export const Stacked: StoryObj<ToastProviderProps> = {
  render: (args) => (
    <ToastProvider {...args}>
      <ShowOnMount />
    </ToastProvider>
  ),
};

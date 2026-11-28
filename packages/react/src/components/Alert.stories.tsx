import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { alert as alertRecipe } from '@becket-ui/tokens/recipes';

import { Alert, type AlertProps } from './Alert';
import { Box } from './Box';
import { Button } from './Button';
import { HStack, VStack } from './Stack';
import { Text } from './Text';

export default {
  title: 'Feedback/Alert',
  component: Alert,
  args: {
    status: 'info',
    title: 'Scheduled maintenance',
    children: 'Uploads are paused on Sunday from 02:00 to 03:00.',
  },
  argTypes: {
    status: { control: { type: 'select' }, options: alertRecipe.variantMap.status },
    title: { control: { type: 'text' } },
    children: { control: { type: 'text' } },
    role: { control: { type: 'select' }, options: ['status', 'alert', 'none'] },
  },
  parameters: { controls: { include: ['status', 'title', 'children', 'role'] } },
} satisfies Meta<typeof Alert>;

type Story = StoryObj<AlertProps>;

export const Default: Story = {};

export const Statuses: Story = {
  render: () => (
    <VStack gap="sm">
      <Alert status="info" title="Heads up">
        The export runs in the background.
      </Alert>
      <Alert status="success" title="Saved">
        Your changes are live.
      </Alert>
      <Alert status="warning" title="Storage almost full">
        You have used 90% of your space.
      </Alert>
      <Alert status="danger" title="Upload failed">
        The document couldn't be read. Try a different file.
      </Alert>
    </VStack>
  ),
};

export const WithoutTitle: Story = {
  args: { title: undefined, status: 'success', children: 'Profile updated.' },
};

export const WithActions: Story = {
  args: {
    status: 'warning',
    title: 'Unsaved changes',
    children: 'Leave the page and your edits are lost.',
    actions: (
      <>
        <Button size="sm" visual="primary">
          Save
        </Button>
        <Button size="sm">Discard</Button>
      </>
    ),
  },
};

export const Dismissible: Story = {
  render: (args) => {
    const [isShown, setIsShown] = useState(true);
    return isShown ? (
      <Alert {...args} onDismiss={() => setIsShown(false)} />
    ) : (
      <Button size="sm" onClick={() => setIsShown(true)}>
        Show the alert again
      </Button>
    );
  },
};

// `role="alert"` interrupts the screen reader: keep it for urgent errors like this one.
export const UrgentError: Story = {
  args: {
    status: 'danger',
    role: 'alert',
    title: 'Payment declined',
    children: 'Your card was declined. Use another card to keep your plan.',
  },
};

// The second panel sets data-theme="light" on itself, so a dark page shows both themes at once.
export const StatusesBothThemes: Story = {
  render: () => (
    <HStack gap="md" align="stretch" style={{ flexWrap: 'wrap' }}>
      {['Page theme', 'Light theme'].map((name) => (
        <Box
          key={name}
          data-theme={name === 'Light theme' ? 'light' : undefined}
          background="background"
          padding="md"
          radius="md"
        >
          <VStack gap="sm">
            <Text fontSize="xs" color="muted">
              {name}
            </Text>
            {alertRecipe.variantMap.status.map((status) => (
              <Alert key={status} status={status} title={status} role="none">
                Message text stays in the text color.
              </Alert>
            ))}
          </VStack>
        </Box>
      ))}
    </HStack>
  ),
};

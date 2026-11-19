import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { spinner as spinnerRecipe } from '@becket-ui/tokens/recipes';
import { Box } from './Box';
import { Button } from './Button';
import { HStack, VStack } from './Stack';
import { Text } from './Text';
import { Spinner, type SpinnerProps } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Feedback/Spinner',
  component: Spinner,
  args: { size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: spinnerRecipe.variantMap.size },
    label: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'label'] },
    docs: {
      description: {
        component:
          'Accessibility: the Spinner is a `role="status"` region whose text is `label` ("Loading" by default). A live region announces changes to its content, and one inserted together with its content is not reliably announced. Keep a persistent region in the DOM before loading starts and mount the Spinner inside it with `role={undefined}` so the regions are not nested: `<div role="status">{isLoading ? <Spinner role={undefined} /> : null}</div>`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<SpinnerProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="md">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </HStack>
  ),
};

export const LoadingRegion: Story = {
  parameters: { controls: { disable: true } },
  render: function LoadingRegionDemo() {
    const [isLoading, setIsLoading] = useState(false);

    return (
      <VStack gap="lg" align="start">
        <Button
          visual="primary"
          onClick={() => {
            if (isLoading) return;
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 3000);
          }}
        >
          Load
        </Button>
        <VStack gap="xs" align="start">
          <Text as="strong" fontSize="sm">
            Persistent region: the Spinner mounts inside a region that was already in the page.
          </Text>
          <Box role="status">{isLoading ? <Spinner role={undefined} /> : null}</Box>
        </VStack>
        <VStack gap="xs" align="start">
          <Text as="strong" fontSize="sm">
            Inserted Spinner: the region and its text arrive together.
          </Text>
          <Box>{isLoading ? <Spinner /> : null}</Box>
        </VStack>
      </VStack>
    );
  },
};

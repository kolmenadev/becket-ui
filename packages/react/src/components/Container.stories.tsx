import type { Meta, StoryObj } from '@storybook/react';
import { container as containerRecipe } from '@becket-ui/tokens/recipes';
import { Box } from './Box';
import { Container, type ContainerProps } from './Container';
import { Heading } from './Heading';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  args: { size: 'lg', padding: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: containerRecipe.variantMap.size },
    padding: { control: { type: 'select' }, options: containerRecipe.variantMap.padding },
  },
  parameters: {
    controls: { include: ['size', 'padding'] },
  },
};
export default meta;

type Story = StoryObj<ContainerProps>;

export const Default: Story = {
  render: (args) => (
    <Container {...args}>
      <Box background="subtle" padding="md" radius="md">
        <Text>Content stays centered and stops at the container&apos;s max width.</Text>
      </Box>
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      {containerRecipe.variantMap.size.map((size) => (
        <Container key={size} size={size}>
          <Box background="subtle" padding="sm" radius="md">
            <Text fontSize="sm">size=&quot;{size}&quot;</Text>
          </Box>
        </Container>
      ))}
    </Stack>
  ),
};

/** Render the page's main landmark directly: `as="main"`. */
export const AsMain: Story = {
  render: () => (
    <Container as="main" size="md">
      <Stack gap="sm">
        <Heading as="h1" size="xl">
          Page title
        </Heading>
        <Text color="muted">Container renders the main landmark, so no wrapper div is needed.</Text>
      </Stack>
    </Container>
  ),
};

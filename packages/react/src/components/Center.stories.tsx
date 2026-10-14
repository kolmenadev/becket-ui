import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';
import { Center, type CenterProps } from './Center';
import { SearchIcon } from './Glyphs';
import { Text } from './Text';

const meta: Meta<typeof Center> = { title: 'Layout/Center', component: Center };
export default meta;

type Story = StoryObj<CenterProps>;

export const Default: Story = {
  render: () => (
    <Box background="subtle" radius="md">
      <Center style={{ minHeight: 'var(--beckui--sizes-34)' }}>
        <Text>Centered on both axes</Text>
      </Center>
    </Box>
  ),
};

export const Inline: Story = {
  render: () => (
    <Text>
      Search{' '}
      <Center inline>
        <SearchIcon size="sm" />
      </Center>{' '}
      in the header.
    </Text>
  ),
};

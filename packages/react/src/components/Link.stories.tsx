import type { Meta, StoryObj } from '@storybook/react';
import { link as linkRecipe } from '@becket-ui/tokens/recipes';
import { Stack } from './Stack';
import { Text } from './Text';
import { Link, type LinkProps } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Typography/Link',
  component: Link,
  args: {
    children: 'Becket docs',
    href: '#',
    visual: 'default',
    visited: false,
  },
  argTypes: {
    visual: { control: { type: 'select' }, options: linkRecipe.variantMap.visual },
    visited: { control: { type: 'boolean' } },
    children: { control: { type: 'text' } },
    href: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['visual', 'visited', 'children', 'href'] },
  },
};
export default meta;

type Story = StoryObj<LinkProps>;

export const Default: Story = {};

export const Muted: Story = {
  args: { visual: 'muted', children: 'Muted link' },
};

export const InText: Story = {
  render: () => (
    <Stack gap="sm">
      <Text>
        Inline <Link href="#">primary link</Link> with a focus ring.
      </Text>
      <Text>
        Optional <Link href="#" visited>
          visited
        </Link>{' '}
        styling.
      </Text>
    </Stack>
  ),
};

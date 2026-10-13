import type { Meta, StoryObj } from '@storybook/react';
import { icon as iconRecipe } from '@becket-ui/tokens/recipes';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  LinkIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  WarningIcon,
} from './Glyphs';
import { Icon, type IconProps } from './Icon';
import { Link } from './Link';
import { Flex } from './Flex';
import { HStack, VStack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof Icon> = {
  title: 'Data Display/Icon',
  component: Icon,
  args: { size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: iconRecipe.variantMap.size },
    label: { control: { type: 'text' } },
  },
  parameters: {
    controls: { include: ['size', 'label'] },
  },
};
export default meta;

type Story = StoryObj<IconProps>;

/** Wrap any inline SVG drawn with `currentColor`. Give it a `label` when it carries meaning. */
export const Default: Story = {
  render: (args) => (
    <Icon {...args} label="Favorite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
        <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z" />
      </svg>
    </Icon>
  ),
};

const GLYPHS = [
  ['ChevronDownIcon', ChevronDownIcon],
  ['ChevronRightIcon', ChevronRightIcon],
  ['CloseIcon', CloseIcon],
  ['MenuIcon', MenuIcon],
  ['CheckIcon', CheckIcon],
  ['CopyIcon', CopyIcon],
  ['ExternalLinkIcon', ExternalLinkIcon],
  ['LinkIcon', LinkIcon],
  ['SearchIcon', SearchIcon],
  ['SunIcon', SunIcon],
  ['MoonIcon', MoonIcon],
  ['InfoIcon', InfoIcon],
  ['WarningIcon', WarningIcon],
] as const;

/** The built-in set: one 24px grid, one stroke width. */
export const Glyphs: Story = {
  render: () => (
    <Flex wrap="wrap" gap="lg">
      {GLYPHS.map(([name, Glyph]) => (
        <VStack key={name} gap="xs" align="center">
          <Glyph size="lg" />
          <Text fontSize="xs" color="muted">
            {name}
          </Text>
        </VStack>
      ))}
    </Flex>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="md" align="center">
      {iconRecipe.variantMap.size.map((size) => (
        <SearchIcon key={size} size={size} />
      ))}
    </HStack>
  ),
};

/** Icons inherit text color, so they follow links, muted text and both themes. */
export const InText: Story = {
  render: () => (
    <VStack gap="sm">
      <Link href="https://github.com/kolmenadev/becket-ui">
        Source on GitHub <ExternalLinkIcon size="sm" />
      </Link>
      <Text color="muted">
        <InfoIcon size="sm" /> Muted text, muted icon.
      </Text>
    </VStack>
  ),
};

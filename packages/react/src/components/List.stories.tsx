import type { Meta, StoryObj } from '@storybook/react';
import { list as listRecipe } from '@becket-ui/tokens/recipes';
import { List, ListItem, type ListProps } from './List';

const meta: Meta<typeof List> = {
  title: 'Typography/List',
  component: List,
  args: { spacing: 'sm' },
  argTypes: {
    spacing: { control: { type: 'select' }, options: listRecipe.variantMap.spacing },
    marker: { control: { type: 'select' }, options: listRecipe.variantMap.marker },
  },
  parameters: { controls: { include: ['spacing', 'marker'] } },
};
export default meta;

type Story = StoryObj<ListProps>;

export const Default: Story = {
  render: (args) => (
    <List {...args}>
      <ListItem>No provider and no theme wrapper</ListItem>
      <ListItem>One CSS import</ListItem>
      <ListItem>Theme on the html element</ListItem>
    </List>
  ),
};

export const Ordered: Story = {
  render: () => (
    <List as="ol">
      <ListItem>Install the packages</ListItem>
      <ListItem>Import the CSS</ListItem>
      <ListItem>Build a screen</ListItem>
    </List>
  ),
};

export const Unstyled: Story = {
  render: () => (
    <List marker="none" spacing="md">
      <ListItem>Docs</ListItem>
      <ListItem>Blog</ListItem>
      <ListItem>GitHub</ListItem>
    </List>
  ),
};

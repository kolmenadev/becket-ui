import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { pagination as paginationRecipe } from '@becket-ui/tokens/recipes';

import { Pagination, type PaginationProps } from './Pagination';
import { Stack } from './Stack';

export default {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 12, siblings: 1, size: 'md', href: (page) => `#page-${page}` },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageCount: { control: { type: 'number', min: 1 } },
    siblings: { control: { type: 'number', min: 0, max: 3 } },
    size: { control: { type: 'select' }, options: paginationRecipe.variantMap.size },
  },
  parameters: { controls: { include: ['page', 'pageCount', 'siblings', 'size'] } },
} satisfies Meta<typeof Pagination>;

type Story = StoryObj<PaginationProps>;

export const Default: Story = {};

export const Middle: Story = { args: { page: 6 } };

export const LastPage: Story = { args: { page: 12 } };

/** With few pages there is no gap to hide, so every page shows. */
export const FewPages: Story = { args: { page: 2, pageCount: 5 } };

export const Siblings: Story = { args: { page: 10, pageCount: 20, siblings: 2 } };

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      {paginationRecipe.variantMap.size.map((size) => (
        <Pagination key={size} {...args} page={4} size={size} aria-label={`Pagination, ${size}`} />
      ))}
    </Stack>
  ),
};

export const CustomLabels: Story = {
  args: {
    page: 3,
    'aria-label': 'Paginación',
    labels: { previous: 'Anterior', next: 'Siguiente', page: (page) => `Página ${page}` },
  },
};

/** `linkAs` takes a router's link component; this stand-in marks the links it renders. */
export const WithRouterLink: Story = {
  args: {
    page: 3,
    linkAs: forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>((props, ref) => (
      <a ref={ref} data-router-link="" {...props} />
    )),
  },
};

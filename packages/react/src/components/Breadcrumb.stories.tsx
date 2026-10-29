import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { breadcrumb as breadcrumbRecipe } from '@becket-ui/tokens/recipes';

import { Breadcrumb, BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb';
import { Stack } from './Stack';

export default {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  args: { size: 'sm', separator: 'chevron' },
  argTypes: {
    size: { control: { type: 'select' }, options: breadcrumbRecipe.variantMap.size },
    separator: { control: { type: 'select' }, options: breadcrumbRecipe.variantMap.separator },
  },
  parameters: { controls: { include: ['size', 'separator'] } },
} satisfies Meta<typeof Breadcrumb>;

type Story = StoryObj<BreadcrumbProps>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="#home">Home</BreadcrumbItem>
      <BreadcrumbItem href="#blog">Blog</BreadcrumbItem>
      <BreadcrumbItem current>Writing tokens</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      {breadcrumbRecipe.variantMap.size.map((size) => (
        <Breadcrumb key={size} {...args} size={size} aria-label={`Breadcrumb, ${size}`}>
          <BreadcrumbItem href="#home">Home</BreadcrumbItem>
          <BreadcrumbItem href="#docs">Docs</BreadcrumbItem>
          <BreadcrumbItem current>Theming</BreadcrumbItem>
        </Breadcrumb>
      ))}
    </Stack>
  ),
};

export const Separators: Story = {
  render: (args) => (
    <Stack gap="md">
      {breadcrumbRecipe.variantMap.separator.map((separator) => (
        <Breadcrumb
          key={separator}
          {...args}
          separator={separator}
          aria-label={`Breadcrumb, ${separator}`}
        >
          <BreadcrumbItem href="#home">Home</BreadcrumbItem>
          <BreadcrumbItem href="#docs">Docs</BreadcrumbItem>
          <BreadcrumbItem current>Theming</BreadcrumbItem>
        </Breadcrumb>
      ))}
    </Stack>
  ),
};

/** With an `href`, the current page stays a link, marked `aria-current="page"`. */
export const CurrentAsLink: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem href="#home">Home</BreadcrumbItem>
      <BreadcrumbItem href="#blog/writing-tokens" current>
        Writing tokens
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** Long trails wrap onto the next line. */
export const LongTrail: Story = {
  render: (args) => (
    // Breadcrumb has no width prop; a size token keeps the trail narrow enough to wrap.
    <Breadcrumb {...args} style={{ maxWidth: 'var(--beckui--sizes-55)' }}>
      {['Home', 'Products', 'Design systems', 'Components', 'Navigation'].map((page) => (
        <BreadcrumbItem key={page} href={`#${page}`}>
          {page}
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/** `as` takes a router's link component; this stand-in marks the links it renders. */
export const WithRouterLink: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      {['Home', 'Blog'].map((page) => (
        <BreadcrumbItem
          key={page}
          href={`#${page}`}
          as={forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>((props, ref) => (
            <a ref={ref} data-router-link="" {...props} />
          ))}
        >
          {page}
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem current>Writing tokens</BreadcrumbItem>
    </Breadcrumb>
  ),
};

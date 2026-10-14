import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';
import { Grid, GridItem, type GridProps } from './Grid';
import { Text } from './Text';

const meta: Meta<typeof Grid> = { title: 'Layout/Grid', component: Grid };
export default meta;

type Story = StoryObj<GridProps>;

const Cell = ({ label }: { label: string }) => (
  <Box background="subtle" radius="md" padding="sm">
    <Text fontSize="sm">{label}</Text>
  </Box>
);

/** 12 columns; items span 8 + 4 (main and sidebar). */
export const Default: Story = {
  render: () => (
    <Grid columns={12} gap="md">
      <GridItem colSpan={8}>
        <Cell label="colSpan 8" />
      </GridItem>
      <GridItem colSpan={4}>
        <Cell label="colSpan 4" />
      </GridItem>
      <GridItem colSpan="full">
        <Cell label="full" />
      </GridItem>
    </Grid>
  ),
};

/** Stacked on small screens, side by side from md. */
export const Responsive: Story = {
  render: () => (
    <Grid columns={{ base: 1, md: 12 }} gap="md">
      <GridItem colSpan={{ base: 'full', md: 6 }}>
        <Cell label="6 from md" />
      </GridItem>
      <GridItem colSpan={{ base: 'full', md: 3 }}>
        <Cell label="3 from md" />
      </GridItem>
      <GridItem colSpan={{ base: 'full', md: 3 }}>
        <Cell label="3 from md" />
      </GridItem>
    </Grid>
  ),
};

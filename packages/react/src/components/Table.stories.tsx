import type { Meta, StoryObj } from '@storybook/react';
import { table as tableRecipe } from '@becket-ui/tokens/recipes';
import { Stack } from './Stack';
import { Table, TableCaption, Tbody, Td, Tfoot, Th, Thead, Tr, type TableProps } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table',
  component: Table,
  args: { size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: tableRecipe.variantMap.size },
  },
  parameters: {
    controls: { include: ['size'] },
  },
};
export default meta;

type Story = StoryObj<TableProps>;

export const Default: Story = {
  render: (args: TableProps) => (
    <Table {...args}>
      <TableCaption>Semantic table markup. Aliases: Thead, Tbody, Tr, Th, Td.</TableCaption>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Qty</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>Alpha</Td>
          <Td>Open</Td>
          <Td>40</Td>
        </Tr>
        <Tr>
          <Td>Beta</Td>
          <Td>Closed</Td>
          <Td>12</Td>
        </Tr>
      </Tbody>
      <Tfoot>
        <Tr>
          <Th>Total</Th>
          <Td colSpan={2}>52</Td>
        </Tr>
      </Tfoot>
    </Table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="lg">
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Small</Th>
            <Th>Qty</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Alpha</Td>
            <Td>4</Td>
          </Tr>
        </Tbody>
      </Table>
      <Table size="md">
        <Thead>
          <Tr>
            <Th>Medium</Th>
            <Th>Qty</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Beta</Td>
            <Td>12</Td>
          </Tr>
        </Tbody>
      </Table>
    </Stack>
  ),
};

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { drawer as drawerRecipe } from '@becket-ui/tokens/recipes';
import { Button } from './Button';
import { Text } from './Text';
import { Drawer, type DrawerProps } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  args: { placement: 'end' },
  argTypes: {
    placement: { control: { type: 'select' }, options: drawerRecipe.variantMap.placement },
  },
  parameters: {
    controls: { include: ['placement'] },
  },
};
export default meta;

type Story = StoryObj<DrawerProps>;

export const Default: Story = {
  render: function DrawerDemo(args: DrawerProps) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button visual="primary" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <Drawer
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="Filters"
          footer={
            <Button visual="primary" onClick={() => setOpen(false)}>
              Done
            </Button>
          }
        >
          <Text>Same a11y as Dialog: Escape, backdrop, focus return. Placement is CSS.</Text>
        </Drawer>
      </>
    );
  },
};

export const Start: Story = {
  ...Default,
  args: { placement: 'start' },
};

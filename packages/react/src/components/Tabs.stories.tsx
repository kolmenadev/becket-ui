import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stack } from './Stack';
import { Text } from './Text';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Disclosure/Tabs',
  component: Tabs,
  parameters: {
    controls: { disable: true },
  },
};
export default meta;

type Story = StoryObj<TabsProps>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabList>
        <Tab value="one">Overview</Tab>
        <Tab value="two">Activity</Tab>
        <Tab value="three" disabled>
          Disabled
        </Tab>
      </TabList>
      <TabPanel value="one">
        <Text>First panel. Arrow keys move between tabs.</Text>
      </TabPanel>
      <TabPanel value="two">
        <Text>Second panel.</Text>
      </TabPanel>
      <TabPanel value="three">
        <Text>Hidden while disabled tab is unused.</Text>
      </TabPanel>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: function ControlledTabs() {
    const [value, setValue] = useState('overview');
    return (
      <Stack gap="md">
        <Tabs value={value} onValueChange={setValue}>
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
          <TabPanel value="overview">
            <Text>Overview panel.</Text>
          </TabPanel>
          <TabPanel value="activity">
            <Text>Activity panel.</Text>
          </TabPanel>
          <TabPanel value="settings">
            <Text>Settings panel.</Text>
          </TabPanel>
        </Tabs>
        <Text color="muted">Selected: {value}</Text>
      </Stack>
    );
  },
};

export const ForcedColors: Story = { ...Default, parameters: { forcedColors: true } };

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Tab, TabList, TabPanel, Tabs } from './Tabs';

function DemoTabs() {
  return (
    <Tabs defaultValue="one">
      <TabList>
        <Tab value="one">Overview</Tab>
        <Tab value="two">Activity</Tab>
        <Tab value="three" disabled>
          Disabled
        </Tab>
      </TabList>
      <TabPanel value="one">First panel.</TabPanel>
      <TabPanel value="two">Second panel.</TabPanel>
      <TabPanel value="three">Hidden.</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('sets horizontal orientation', () => {
    render(<DemoTabs />);
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('moves to first and last enabled tab with Home and End', async () => {
    const user = userEvent.setup();
    render(<DemoTabs />);
    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Activity' }));
  });

  it('has no axe violations', async () => {
    const { container } = render(<DemoTabs />);
    await assertNoAxeViolations(container);
  });
});

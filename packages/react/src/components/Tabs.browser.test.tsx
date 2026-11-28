import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Button } from './Button';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

afterEach(cleanup);

describe('Tabs', () => {
  it('moves focus and selection the way APG Tabs with automatic activation does', async () => {
    render(
      <>
        <Button>Before</Button>
        <Tabs defaultValue="activity">
          <TabList aria-label="Project">
            <Tab value="overview">Overview</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
          <TabPanel value="overview">Overview panel.</TabPanel>
          <TabPanel value="activity">Activity panel.</TabPanel>
          <TabPanel value="settings">Settings panel.</TabPanel>
        </Tabs>
      </>,
    );
    page.getByRole('button', { name: 'Before' }).element().focus();

    // APG Tabs, keyboard interaction (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): Tab enters
    // the tab list on the selected tab (landing on Activity proves Overview isn't a tab stop) and
    // leaves it for the panel. With automatic activation, the arrows, Home and End move focus and
    // select the tab they land on.
    await userEvent.tab();
    await expect.element(page.getByRole('tab', { name: 'Activity' })).toHaveFocus();

    for (const { key, tab } of [
      { key: '{ArrowRight}', tab: 'Settings' },
      { key: '{ArrowLeft}', tab: 'Activity' },
      { key: '{Home}', tab: 'Overview' },
      { key: '{End}', tab: 'Settings' },
    ]) {
      await userEvent.keyboard(key);
      await expect.element(page.getByRole('tab', { name: tab })).toHaveFocus();
      await expect
        .element(page.getByRole('tab', { name: tab }))
        .toHaveAttribute('aria-selected', 'true');
      await expect.element(page.getByRole('tabpanel', { name: tab })).toBeVisible();
    }

    await userEvent.tab();
    await expect.element(page.getByRole('tabpanel', { name: 'Settings' })).toHaveFocus();
  });
});

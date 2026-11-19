import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

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

function AlphaBetaGamma(props: TabsProps) {
  return (
    <Tabs {...props}>
      <TabList>
        <Tab value="a">Alpha</Tab>
        <Tab value="b">Beta</Tab>
        <Tab value="c">Gamma</Tab>
      </TabList>
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
    expect(screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Activity' }));
  });

  it('calls the latest onValueChange', async () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<AlphaBetaGamma value="a" onValueChange={first} />);
    rerender(<AlphaBetaGamma value="a" onValueChange={latest} />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Beta' }));
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(first).not.toHaveBeenCalled();
    expect(latest.mock.calls).toEqual([['b'], ['c']]);
  });

  it('controlled without defaultValue', () => {
    render(
      <>
        <Tabs value="a" onValueChange={() => {}}>
          <TabList>
            <Tab value="a">Alpha</Tab>
          </TabList>
        </Tabs>
        {/* @ts-expect-error uncontrolled Tabs still needs defaultValue, so one tab is always selected */}
        <Tabs>
          <TabList>
            <Tab value="b">Beta</Tab>
          </TabList>
        </Tabs>
      </>,
    );
    expect(screen.getByRole('tab', { name: 'Alpha' }).getAttribute('aria-selected')).toBe('true');
  });

  it('switches control mode', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<AlphaBetaGamma defaultValue="b" onValueChange={onValueChange} />);
    rerender(<AlphaBetaGamma value="b" defaultValue="b" onValueChange={onValueChange} />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(screen.getByRole('tab', { name: 'Beta' }).getAttribute('aria-selected')).toBe('true');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('c');
  });

  it('follows clicks after switching from controlled to uncontrolled', async () => {
    const { rerender } = render(<AlphaBetaGamma value="a" defaultValue="a" />);
    rerender(<AlphaBetaGamma defaultValue="a" />);
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(screen.getByRole('tab', { name: 'Gamma' }).getAttribute('aria-selected')).toBe('true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<DemoTabs />);
    await assertNoAxeViolations(container);
  });
});

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import '@becket-ui/tokens/index.css';

import { Step, Steps } from './Steps';

afterEach(cleanup);

describe('Steps', () => {
  it('draws the current marker with a thicker ring and bold text, without changing its size', async () => {
    render(
      <Steps aria-label="Sign-up progress">
        <Step status="complete" title="Account" />
        <Step status="current" title="Profile" />
        <Step status="upcoming" title="Done" />
      </Steps>,
    );

    const [complete, current, upcoming] = page
      .getByRole('listitem')
      .elements()
      .map((step) => ({
        marker: getComputedStyle(step.children[0]),
        box: step.children[0].getBoundingClientRect(),
        title: getComputedStyle(step.children[1].children[0]),
      }));

    // Windows contrast themes and grayscale drop color; the widths and weight stay.
    expect(complete.marker.borderTopWidth).toBe('2px');
    expect(current.marker.borderTopWidth).toBe('3px');
    expect(upcoming.marker.borderTopWidth).toBe('2px');
    expect(Number(current.marker.fontWeight)).toBeGreaterThan(Number(upcoming.marker.fontWeight));
    expect(Number(current.title.fontWeight)).toBeGreaterThan(Number(upcoming.title.fontWeight));
    expect([current.box.width, current.box.height]).toEqual([
      upcoming.box.width,
      upcoming.box.height,
    ]);
  });
});

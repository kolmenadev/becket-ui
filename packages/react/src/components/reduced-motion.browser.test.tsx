import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { commands } from 'vitest/browser';
import '@becket-ui/tokens/index.css';

import { Button } from './Button';
import { Spinner } from './Spinner';
import { Switch } from './Switch';
import { TextField } from './TextField';

declare module 'vitest/browser' {
  // style-check keep: module augmentation; TypeScript merges it into Vitest's type for `commands`.
  interface BrowserCommands {
    emulateReducedMotion: (value: 'reduce' | 'no-preference') => Promise<void>;
  }
}

afterEach(cleanup);

// getComputedStyle reports 0.01ms as "1e-05s", so compare seconds, not strings.
const seconds = (duration: string) => Number.parseFloat(duration);

describe('prefers-reduced-motion: reduce', () => {
  beforeEach(async () => {
    await commands.emulateReducedMotion('reduce');
    onTestFinished(() => commands.emulateReducedMotion('no-preference'));
    expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
  });

  it('stops the Spinner rotating', () => {
    render(<Spinner />);

    expect(getComputedStyle(screen.getByRole('status')).animationName).toBe('none');
  });

  it('removes the Button transition', () => {
    render(<Button>Save</Button>);

    expect(
      seconds(getComputedStyle(screen.getByRole('button', { name: 'Save' })).transitionDuration),
    ).toBeLessThanOrEqual(0.00001);
  });

  it('removes the Switch track and thumb transitions', () => {
    render(<Switch label="Notifications" />);
    // The track and its thumb are aria-hidden, so no role or name reaches them.
    const parts = screen.getByRole('switch', { name: 'Notifications' }).querySelectorAll('span');

    expect(parts).toHaveLength(2);
    for (const part of parts) {
      expect(seconds(getComputedStyle(part).transitionDuration)).toBeLessThanOrEqual(0.00001);
    }
  });

  it('removes the TextField transition', () => {
    render(<TextField label="Offset" />);

    expect(
      seconds(getComputedStyle(screen.getByRole('textbox', { name: 'Offset' })).transitionDuration),
    ).toBeLessThanOrEqual(0.00001);
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Step, Steps } from './Steps';

describe('Steps', () => {
  it('lists the steps in order and marks the current one', async () => {
    const { container } = render(
      <Steps aria-label="Sign-up progress">
        <Step status="complete" title="Account" />
        <Step status="current" title="Profile" description="Name and photo" />
        <Step status="upcoming" title="Done" />
      </Steps>,
    );
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(steps.map((step) => step.getAttribute('aria-current'))).toEqual([null, 'step', null]);
    // Screen readers hear each step's state after its title; the current one has aria-current.
    expect(steps.map((step) => step.textContent)).toEqual([
      'Account (completed)',
      'ProfileName and photo',
      'Done (not started)',
    ]);
    await assertNoAxeViolations(container);
  });

  it('takes a translated status label', () => {
    render(
      <Steps aria-label="Progreso">
        <Step status="complete" title="Cuenta" statusLabel="(completado)" />
        <Step status="current" title="Perfil" statusLabel="(paso actual)" />
      </Steps>,
    );
    expect(screen.getAllByRole('listitem').map((step) => step.textContent)).toEqual([
      'Cuenta (completado)',
      'Perfil (paso actual)',
    ]);
  });

  it('shows a check for a completed step and leaves the number to CSS otherwise', () => {
    render(
      <Steps aria-label="Progress">
        <Step status="complete" title="One" />
        <Step status="upcoming" title="Two" />
      </Steps>,
    );
    const [done, next] = screen.getAllByRole('listitem');
    expect(done.querySelector('svg')).not.toBeNull();
    expect(next.querySelector('[aria-hidden="true"]')?.childElementCount).toBe(0);
  });

  it('applies the orientation and size variants and keeps consumer classes last', () => {
    render(
      <Steps aria-label="Progress" orientation="vertical" size="sm" className="extra">
        <Step status="current" title="One" />
      </Steps>,
    );
    const list = screen.getByRole('list', { name: 'Progress' });
    expect(list.className).toMatch(/steps__root--orientation_vertical/);
    expect(list.className).toMatch(/steps__root--size_sm/);
    expect(list.className.endsWith('extra')).toBe(true);
  });
});

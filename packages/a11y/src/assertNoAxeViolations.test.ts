import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { assertNoAxeViolations } from './assertNoAxeViolations';

function mount(html: string) {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('assertNoAxeViolations', () => {
  it('fails a nameless button', async () => {
    await expect(assertNoAxeViolations(mount('<button></button>'))).rejects.toThrow(
      /button-name|Button name/i,
    );
  });

  it('passes a native labelled checkbox', async () => {
    await expect(
      assertNoAxeViolations(
        mount('<input id="terms" type="checkbox" /><label for="terms">Accept terms</label>'),
      ),
    ).resolves.toBeUndefined();
  });

  it('runs the WCAG 2.0, 2.1 and 2.2 A and AA tags and the best practices', async () => {
    vi.spyOn(axe, 'run');

    await assertNoAxeViolations(mount('<button>Save</button>'));

    expect(axe.run).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      }),
    );
  });

  it('rejects a rule turned off without an exception entry for the environment', async () => {
    await expect(
      assertNoAxeViolations(mount('<button>Save</button>'), {
        environment: 'browser',
        rules: { 'color-contrast': { enabled: false } },
      }),
    ).rejects.toThrow('axe rule color-contrast disabled without an exception entry');
    await expect(
      assertNoAxeViolations(mount('<button>Save</button>'), {
        environment: 'jsdom',
        rules: { 'color-contrast': { enabled: false } },
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects once an exception has expired', async () => {
    vi.setSystemTime('2100-01-01');

    await expect(assertNoAxeViolations(mount('<button>Save</button>'))).rejects.toThrow(
      /axe exception for \S+ expired on \d{4}-\d{2}-\d{2}/,
    );
  });

  it('fails an unnamed dialog', async () => {
    // An ARIA dialog, not <dialog open>: jsdom has no document.elementFromPoint, so axe errors on a
    // native open dialog and returns its rules as incomplete instead of a verdict.
    await expect(
      assertNoAxeViolations(mount('<div role="dialog"><p>Saved</p></div>')),
    ).rejects.toThrow(/aria-dialog-name/);
  });

  it('warns about the rules axe could not decide, without failing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // axe can't tell whether a video without a track has captions, so video-caption is incomplete.
    await expect(
      assertNoAxeViolations(mount('<video src="clip.mp4"></video>')),
    ).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('video-caption'));
  });
});

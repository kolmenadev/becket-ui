import { afterEach, describe, expect, it, vi } from 'vitest';

import { warnDeprecated } from './deprecate';

describe('warnDeprecated', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('warns once for three calls with the same key', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const message = '`Button` prop `visual` is deprecated; use `appearance`. Removed in 1.0.';
    warnDeprecated('Button.visual', message);
    warnDeprecated('Button.visual', message);
    warnDeprecated('Button.visual', message);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(`[Becket UI] ${message}`);
  });

  it('warns once for each distinct key', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDeprecated(
      'Field.hint',
      '`Field` prop `hint` is deprecated; use `helper`. Removed in 1.0.',
    );
    warnDeprecated(
      'Field.caption',
      '`Field` prop `caption` is deprecated; use `description`. Removed in 1.0.',
    );
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnDeprecated('Tag.tone', '`Tag` prop `tone` is deprecated; use `status`. Removed in 1.0.');
    expect(console.warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

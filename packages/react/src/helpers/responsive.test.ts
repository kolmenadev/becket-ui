import { describe, expect, it } from 'vitest';

import {
  normalizeGapValue,
  normalizeResponsiveValue,
  resolveBreakpointAlias,
  SEMANTIC_TO_BREAKPOINT,
} from './responsive';

describe('responsive breakpoints (KAN-120)', () => {
  it('maps semantic aliases to Chakra token breakpoints', () => {
    expect(SEMANTIC_TO_BREAKPOINT.mobile).toBe('base');
    expect(SEMANTIC_TO_BREAKPOINT.tablet).toBe('md');
    expect(SEMANTIC_TO_BREAKPOINT.desktop).toBe('lg');
    expect(SEMANTIC_TO_BREAKPOINT.largeDesktop).toBe('xl');
    expect(resolveBreakpointAlias('desktop')).toBe('lg');
    expect(resolveBreakpointAlias('md')).toBe('md');
  });

  it('expands semantic keys in responsive objects', () => {
    expect(normalizeResponsiveValue({ mobile: 1, desktop: 4 })).toEqual({
      base: 1,
      lg: 4,
    });
  });

  it('does not overwrite explicit token keys with semantic aliases', () => {
    expect(
      normalizeResponsiveValue({ base: 2, mobile: 1, lg: 3, desktop: 9 }),
    ).toEqual({
      base: 2,
      lg: 3,
    });
  });

  it('normalizes gap numbers inside semantic maps', () => {
    expect(normalizeGapValue({ mobile: 3, desktop: 'md' })).toEqual({
      base: '3',
      lg: 'md',
    });
  });
});

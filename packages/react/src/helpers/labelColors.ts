import type { CSSProperties } from 'react';

export const LABEL_COLOR_VARS = {
  background: '--mav-label-bg',
  border: '--mav-label-border',
  color: '--mav-label-color',
  gradient: '--mav-label-gradient',
};

/** Downstream apps pass CSS values (tokens, vars, or literals) for label surfaces. */
export type LabelCustomColors = {
  background?: string;
  border?: string;
  color?: string;
  gradient?: string;
};

/** `success`, `warning`, `danger` and `info` are status: they never use a brand color. */
export type LabelVisual =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const VISUAL_DEFAULTS: Record<LabelVisual, LabelCustomColors> = {
  primary: {
    background: 'var(--beckui--colors-primary)',
    color: 'var(--beckui--colors-neutral-900)',
    border: 'transparent',
  },
  secondary: {
    background: 'var(--beckui--colors-secondary)',
    color: 'var(--beckui--colors-neutral-900)',
    border: 'transparent',
  },
  neutral: {
    background: 'var(--beckui--colors-neutral-800)',
    color: 'var(--beckui--colors-neutral-50)',
    border: 'transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--beckui--colors-accent)',
    border: 'var(--beckui--colors-accent)',
  },
  // Status fills flip with the theme, so the ink is the canvas color: the pair is the same one
  // contrast.test.mjs checks for status text on background (4.5:1 in dark and light).
  success: {
    background: 'var(--beckui--colors-success)',
    color: 'var(--beckui--colors-background)',
    border: 'transparent',
  },
  warning: {
    background: 'var(--beckui--colors-warning)',
    color: 'var(--beckui--colors-background)',
    border: 'transparent',
  },
  danger: {
    background: 'var(--beckui--colors-danger)',
    color: 'var(--beckui--colors-background)',
    border: 'transparent',
  },
  info: {
    background: 'var(--beckui--colors-info)',
    color: 'var(--beckui--colors-background)',
    border: 'transparent',
  },
};

const GRADIENT_DEFAULTS: Record<LabelVisual, string> = {
  primary: 'var(--beckui--gradients-primary)',
  secondary: 'var(--beckui--gradients-secondary)',
  neutral: 'var(--beckui--gradients-neutral)',
  outline: 'var(--beckui--gradients-primary)',
  // Brand gradients would read as brand, so a status chip stays one flat status color.
  success: 'linear-gradient(var(--beckui--colors-success), var(--beckui--colors-success))',
  warning: 'linear-gradient(var(--beckui--colors-warning), var(--beckui--colors-warning))',
  danger: 'linear-gradient(var(--beckui--colors-danger), var(--beckui--colors-danger))',
  info: 'linear-gradient(var(--beckui--colors-info), var(--beckui--colors-info))',
};

export function resolveLabelColorVars(
  visual: LabelVisual,
  withGradient: boolean,
  customColors?: LabelCustomColors,
): CSSProperties {
  const defaults = VISUAL_DEFAULTS[visual];
  const merged: LabelCustomColors = { ...defaults, ...customColors };

  const vars: Record<string, string | undefined> = {
    [LABEL_COLOR_VARS.background]: merged.background,
    [LABEL_COLOR_VARS.border]: merged.border,
    [LABEL_COLOR_VARS.color]: merged.color,
  };

  if (withGradient) {
    vars[LABEL_COLOR_VARS.gradient] =
      customColors?.gradient ?? GRADIENT_DEFAULTS[visual];
  }

  return Object.fromEntries(
    Object.entries(vars).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as CSSProperties;
}

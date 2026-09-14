import type { CSSProperties } from 'react';

export const LABEL_COLOR_VARS = {
  background: '--mav-label-bg',
  border: '--mav-label-border',
  color: '--mav-label-color',
  gradient: '--mav-label-gradient',
} as const;

/** Downstream apps pass CSS values (tokens, vars, or literals) for label surfaces. */
export type LabelCustomColors = {
  background?: string;
  border?: string;
  color?: string;
  gradient?: string;
};

export type LabelVisual = 'primary' | 'secondary' | 'neutral' | 'outline';

const VISUAL_DEFAULTS: Record<LabelVisual, LabelCustomColors> = {
  primary: {
    background: 'var(--beckui--colors-primary)',
    color: 'var(--beckui--colors-text)',
    border: 'transparent',
  },
  secondary: {
    background: 'var(--beckui--colors-secondary)',
    color: 'var(--beckui--colors-text)',
    border: 'transparent',
  },
  neutral: {
    background: 'var(--beckui--colors-neutral-800)',
    color: 'var(--beckui--colors-text)',
    border: 'transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--beckui--colors-secondary)',
    border: 'var(--beckui--colors-secondary)',
  },
};

const GRADIENT_DEFAULTS: Record<LabelVisual, string> = {
  primary: 'var(--beckui--gradients-primary)',
  secondary: 'var(--beckui--gradients-secondary)',
  neutral: 'var(--beckui--gradients-neutral)',
  outline: 'var(--beckui--gradients-primary)',
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

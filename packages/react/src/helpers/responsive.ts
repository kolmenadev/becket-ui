import type { ConditionalValue } from '@becket-ui/tokens/types';

/**
 * Responsive props — Chakra-aligned, mobile-first (min-width).
 *
 * Prefer **object syntax** with a `base`/`mobile` value (Chakra docs + community
 * best practice). Arrays are supported for parity but are harder to read.
 *
 * @see https://chakra-ui.com/docs/styling/responsive-design
 */

/** Token breakpoints (Panda / Chakra keys). */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Semantic aliases for layout in consuming apps.
 * Map onto token breakpoints — do not invent separate media queries.
 */
export type SemanticBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

export type BreakpointAlias = Breakpoint | SemanticBreakpoint;

/** Breakpoint-only keys for responsive object props (token + semantic). */
export type BreakpointMap<T> = Partial<Record<BreakpointAlias, T>>;

/**
 * Chakra-style responsive value: single value, per-breakpoint object, or array
 * (index 0 = base, 1 = sm, 2 = md, …).
 */
export type ResponsiveValue<T> = ConditionalValue<T> | BreakpointMap<T>;

export const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const satisfies readonly Breakpoint[];

export const SEMANTIC_BREAKPOINTS = [
  'mobile',
  'tablet',
  'desktop',
  'largeDesktop',
] as const satisfies readonly SemanticBreakpoint[];

/** Semantic → token breakpoint (Chakra mobile-first scale). */
export const SEMANTIC_TO_BREAKPOINT = {
  mobile: 'base',
  tablet: 'md',
  desktop: 'lg',
  largeDesktop: 'xl',
} as const satisfies Record<SemanticBreakpoint, Breakpoint>;

/** Becket-authored spacing steps (Fibonacci + zero). */
export const SPACING_SCALE = [0, 1, 2, 3, 5, 8, 13, 21, 34] as const;

export type SpacingStep = (typeof SPACING_SCALE)[number];

/** Semantic aliases preferred in apps. */
export type SpacingSemantic = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs';

/**
 * Values that show up in IDE autocomplete for `gap` / spacing props.
 * Numeric literals + string keys + semantic tokens.
 * `(string & {})` / `(number & {})` keep IntelliSense while allowing escapes.
 */
export type SpacingScale =
  | SpacingSemantic
  | SpacingStep
  | `${SpacingStep}`
  | (string & {})
  | (number & {});

/** Gap prop: single value or responsive ConditionalValue. */
export type GapValue = ResponsiveValue<SpacingScale>;

export function isSemanticBreakpoint(key: string): key is SemanticBreakpoint {
  return (SEMANTIC_BREAKPOINTS as readonly string[]).includes(key);
}

export function isTokenBreakpoint(key: string): key is Breakpoint {
  return (BREAKPOINTS as readonly string[]).includes(key);
}

/** Resolve `desktop` → `lg`, leave `md` unchanged. */
export function resolveBreakpointAlias(key: string): string {
  if (isSemanticBreakpoint(key)) return SEMANTIC_TO_BREAKPOINT[key];
  return key;
}

/**
 * Expand semantic keys in a responsive object to token breakpoints.
 * Token keys already present win (not overwritten by semantic aliases).
 * Non-objects / arrays pass through.
 */
export function normalizeResponsiveValue<T>(value: T): T {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  const input = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  // Pass 1: token keys
  for (const [key, entry] of Object.entries(input)) {
    if (isTokenBreakpoint(key) || key === 'base') {
      out[key] = normalizeResponsiveValue(entry);
    }
  }
  // Pass 2: semantic → token if token slot empty
  for (const [key, entry] of Object.entries(input)) {
    if (!isSemanticBreakpoint(key)) {
      if (!isTokenBreakpoint(key) && key !== 'base') {
        // Unknown keys (e.g. _hover) — keep as-is for Panda
        out[key] = normalizeResponsiveValue(entry);
      }
      continue;
    }
    const token = SEMANTIC_TO_BREAKPOINT[key];
    if (out[token] === undefined) {
      out[token] = normalizeResponsiveValue(entry);
    }
  }
  return out as T;
}

/**
 * Coerce gap values so `gap={3}` and `gap="3"` both resolve to token key `"3"`.
 * Walks responsive objects/arrays. Leaves semantic tokens unchanged.
 * Expands semantic breakpoint keys (`mobile` → `base`, etc.).
 */
export function normalizeGapValue<T>(gap: T): T {
  if (typeof gap === 'number' && Number.isFinite(gap)) {
    return String(gap) as T;
  }
  if (Array.isArray(gap)) {
    return gap.map((item) => normalizeGapValue(item)) as T;
  }
  if (gap && typeof gap === 'object') {
    const withBreakpoints = normalizeResponsiveValue(gap) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(withBreakpoints)) {
      out[key] = normalizeGapValue(value);
    }
    return out as T;
  }
  return gap;
}

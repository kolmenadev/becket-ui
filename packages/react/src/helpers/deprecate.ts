const warnedKeys = new Set<string>();

// The component tsconfig does not load @types/node, and tsc fails on a bare process name (seen on MAV-190).
// style-check keep: inlining would change behavior; bundlers only replace this global name.
declare const process: { env: { NODE_ENV?: string } };

export function warnDeprecated(key: string, message: string): void {
  // Bundlers replace process.env.NODE_ENV, so the warning folds away in production.
  // Do not guard with typeof process: a missing process must not be treated as development.
  if (process.env.NODE_ENV === 'production' || warnedKeys.has(key)) return;
  warnedKeys.add(key);
  console.warn(`[Becket UI] ${message}`);
}

// The a11y standard (§3) lets a test turn an axe rule off only through an entry here, so every
// skipped rule has an owner and an end date. `fragment` entries hold in both environments.
export const axeExceptions: {
  rule: string;
  scope: 'jsdom' | 'browser' | 'fragment';
  reason: string;
  owner: string;
  expires: string;
}[] = [
  {
    rule: 'color-contrast',
    scope: 'jsdom',
    reason:
      'jsdom does not paint, so contrast is unmeasurable there; browser axe checks it (MAV-10).',
    owner: 'A11y',
    expires: '2027-08-20',
  },
  {
    rule: 'target-size',
    scope: 'jsdom',
    reason:
      'jsdom does not lay out, so target size is unmeasurable there; browser axe checks it (MAV-10).',
    owner: 'A11y',
    expires: '2027-08-20',
  },
];

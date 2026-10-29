// One case per rule (MAV-170): `invalid` files must produce exactly `expect` (report lines without
// the trailing `— rule`, which `rule` names), and `valid` files must produce nothing. Paths matter:
// app-code and component rules only apply under their folders, as in the checker.
export const rules = [
  {
    rule: 'CODING-STYLE § Avoid hasty abstraction',
    invalid: {
      'src/once.ts': `export function total(prices: number[]) {
  const sum = prices.reduce((a, b) => a + b, 0);
  return sum;
}
`,
      'src/alias.ts': `export function first(input: { items: string[] }) {
  const items = input.items;
  return items[0];
}
`,
      'src/helper.ts': `function double(n: number) {
  return n * 2;
}
export const pair = [double(1), double(2)];
`,
      'src/unused.ts': `export function noop() {
  const unused = 1;
}
`,
      'src/loop.ts': `export function scale(values: number[]) {
  const factor = Math.random();
  return values.map((v) => v * factor);
}
`,
    },
    expect: [
      "src/alias.ts:2  [must] items: alias of `input.items`, used 1×; write `input.items` where it's used",
      "src/helper.ts:1  [must] double: helper used 2× (lines 4, 4); the guide abstracts at the third copy, so write it out at each use or restructure so it's needed once",
      'src/loop.ts:2  [must] factor: used once (line 3); inline it (the use is inside a loop or callback: keep it only if inlining would repeat real work, and say so in a comment)',
      'src/once.ts:2  [must] sum: used once (line 3); inline it',
      'src/unused.ts:2  [must] unused: declared, never used',
    ],
    valid: {
      'src/ok.ts': `function triple(n: number) {
  return n * 3;
}
export const values = [triple(1), triple(2), triple(3)];
export function total(prices: number[]) {
  return prices.reduce((a, b) => a + b, 0);
}
function countdown(n: number): number {
  return n === 0 ? 0 : countdown(n - 1);
}
export { countdown };
`,
    },
  },
  {
    rule: 'CODING-STYLE § Prefer inference inside, explicit types at boundaries',
    invalid: {
      'src/cast.ts': `export const size = (window as unknown as { size: number }).size;
export const el = document.querySelector('main')!;
`,
    },
    expect: [
      'src/cast.ts:1  [must] `as unknown` without a comment saying why',
      'src/cast.ts:1  [must] `as { size: number }` without a comment saying why',
      'src/cast.ts:2  [must] `!` without a comment saying why',
    ],
    valid: {
      'src/cast.ts': `// The test runner adds \`size\` to window; it isn't in the DOM types.
export const size = (window as unknown as { size: number }).size;
export const el = document.querySelector('main')!; // the layout always renders <main>
`,
    },
  },
  {
    rule: 'CODING-STYLE § Must use as const only when you need the literal types',
    invalid: { 'src/roles.ts': `export const roles = ['owner', 'admin'] as const;\n` },
    expect: [
      'src/roles.ts:1  [must] `as const` without a comment saying which literal types it keeps',
    ],
    valid: {
      'src/roles.ts': `// Literal types for the Role union below.
export const roles = ['owner', 'admin'] as const;
`,
    },
  },
  {
    rule: 'CODING-STYLE § Must not mutate arrays or objects you don’t own',
    invalid: {
      'src/sort.ts': `export const ranked = (scores: number[]) => scores
  .filter(Boolean)
  .sort();
export const flip = (list: number[]) => list.reverse();
export const drop = (list: number[]) => list.splice(0, 1);
`,
    },
    expect: [
      'src/sort.ts:3  [prefer] .sort() mutates in place; use .toSorted()',
      'src/sort.ts:4  [prefer] .reverse() mutates in place; use .toReversed()',
      'src/sort.ts:5  [prefer] .splice() mutates in place; use .toSpliced()',
    ],
    valid: { 'src/sort.ts': `export const ranked = (scores: number[]) => scores.toSorted();\n` },
  },
  {
    rule: 'CODING-STYLE § Name consistency',
    invalid: {
      'src/limits.ts': `export function limit() {\n  const MAX_ITEMS = 10;\n  return MAX_ITEMS + MAX_ITEMS + MAX_ITEMS;\n}\n`,
    },
    expect: [
      'src/limits.ts:2  [must] MAX_ITEMS: UPPER_SNAKE_CASE is for environment variables; use camelCase',
    ],
    valid: {
      'src/limits.ts': `export function limit() {
  const API_URL = process.env.API_URL;
  const maxItems = 10;
  return [API_URL, maxItems, maxItems, maxItems, API_URL, API_URL];
}
`,
    },
  },
  {
    rule: 'CODING-STYLE § Name consistency › Boolean',
    invalid: {
      'src/Toggle.tsx': `import { useState } from 'react';
export function Toggle() {
  const [loading, setLoading] = useState(false);
  return <p onClick={() => setLoading(!loading)}>{String(loading)}</p>;
}
`,
    },
    expect: ['src/Toggle.tsx:3  [must] loading: booleans start with is, has, does, should or can'],
    valid: {
      'src/Toggle.tsx': `import { useState } from 'react';
export function Toggle() {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  return <p onClick={() => [setIsLoading(!isLoading), setOpen(!open)]}>{String(isLoading && open)}</p>;
}
`,
    },
  },
  {
    rule: 'CODING-STYLE § Avoid implied keywords in function names',
    invalid: {
      'src/user.ts': `export function getUser(id: string) {
  return { id };
}
export const getName = (user: { name: string }) => user.name;
`,
    },
    expect: [
      'src/user.ts:1  [must] getUser: drop the get prefix and name what it does (select, find, format, to…)',
      'src/user.ts:4  [must] getName: drop the get prefix and name what it does (select, find, format, to…)',
    ],
    valid: { 'src/user.ts': `export function findUser(id: string) {\n  return { id };\n}\n` },
  },
  {
    rule: 'CODING-STYLE § Initialisms',
    invalid: {
      'src/links.ts': `export function toLink(userId: string, inviteUrl: string) {\n  return userId + inviteUrl;\n}\n`,
    },
    expect: [
      'src/links.ts:1  [must] userId: initialisms keep one case (userID, inviteURL, parseHTML)',
      'src/links.ts:1  [must] inviteUrl: initialisms keep one case (userID, inviteURL, parseHTML)',
    ],
    valid: {
      'src/links.ts': `export function toLink(userID: string, inviteURL: string) {\n  return userID + inviteURL;\n}\n`,
    },
  },
  {
    rule: 'CODING-STYLE § Prefer object parameters when there are more than 2',
    invalid: {
      'src/invite.ts': `export function invite(email: string, role: string, days: number) {\n  return [email, role, days];\n}\n`,
    },
    expect: ['src/invite.ts:1  [prefer] 3 positional parameters; pass one object'],
    valid: {
      'src/invite.ts': `export function invite({ email, role, days }: { email: string; role: string; days: number }) {
  return [email, role, days];
}
export const totals = [1, 2].reduce((sum, value, index) => sum + value + index, 0);
`,
    },
  },
  {
    rule: 'CODING-STYLE § Must not use any',
    invalid: { 'src/parse.ts': `export function parse(input: any) {\n  return input;\n}\n` },
    expect: [
      'src/parse.ts:1  [must] `any` (and `as any`, even with a comment); use `unknown` and narrow it, or write the real type',
    ],
    valid: { 'src/parse.ts': `export function parse(input: unknown) {\n  return input;\n}\n` },
  },
  {
    rule: 'CODING-STYLE § Prefer unions and as const over enums',
    invalid: { 'src/role.ts': `export enum Role {\n  Owner,\n  Admin,\n}\n` },
    expect: ['src/role.ts:1  [prefer] enum Role; use a string union or an `as const` array'],
    valid: { 'src/role.ts': `export type Role = 'owner' | 'admin';\n` },
  },
  {
    rule: 'CODING-STYLE § Prefer to reduce nesting',
    invalid: {
      'src/color.ts': `export function color(score: number) {
  if (score > 90) {
    return 'danger';
  } else {
    return 'success';
  }
}
`,
    },
    expect: [
      'src/color.ts:4  [prefer] `else` after a return or throw; drop the else and un-indent',
    ],
    valid: {
      'src/color.ts': `export function color(score: number) {
  if (score > 90) return 'danger';
  return 'success';
}
`,
    },
  },
  {
    rule: 'CODING-STYLE § Must use stable keys',
    invalid: {
      'src/List.tsx': `export function Names({ names }: { names: string[] }) {
  return names.map((name, index) => <b key={index}>{name}</b>);
}
`,
    },
    expect: ['src/List.tsx:2  [must] key={index}; use a stable ID from the data'],
    valid: {
      'src/List.tsx': `export function Names({ names }: { names: string[] }) {
  return names.map((name) => <b key={name}>{name}</b>);
}
`,
    },
  },
  {
    rule: 'CODING-STYLE § Name props onX and handlers handleX',
    invalid: {
      // Used three times, so only the naming rule fires (not "used once" or "helper used 2×").
      'src/Save.tsx': `export function Save() {
  const onSave = () => console.log('saved');
  return <b onClick={onSave} onKeyDown={onSave} onDoubleClick={onSave} />;
}
`,
    },
    expect: ['src/Save.tsx:2  [must] onSave: a handler inside a component is handleSave'],
    valid: {
      'src/Save.tsx': `export function Save() {
  const handleSave = () => console.log('saved');
  return <b onClick={handleSave} onKeyDown={handleSave} onDoubleClick={handleSave} />;
}
`,
      'src/save.ts': `export const onSave = () => console.log('saved');\n`,
    },
  },
  {
    rule: 'CODING-STYLE § Use effects only to sync with something outside React',
    invalid: {
      'src/Title.tsx': `import { useEffect } from 'react';
export function Title({ text }: { text: string }) {
  useEffect(() => {
    document.title = text;
  }, [text]);
  return <b>{text}</b>;
}
`,
    },
    expect: [
      'src/Title.tsx:3  [review] an effect: confirm it syncs with something outside React (not derived state or an event)',
    ],
    valid: {
      'src/Title.tsx': `export function Title({ text }: { text: string }) {\n  return <b>{text}</b>;\n}\n`,
    },
  },
  {
    rule: 'building-with-becket § 3 / becket.mdc § Styling',
    invalid: {
      'apps/next-example/app/Badge.tsx': `export const badgeColor = '#ff0000';\n`,
      'packages/react/src/components/Dot.tsx': `export const dotColor = 'rgb(0, 0, 0)';\n`,
      'packages/react/src/components/Dot.stories.tsx': `export default { title: 'Data Display/Dot' };\n`,
    },
    expect: [
      "apps/next-example/app/Badge.tsx:1  [must] literal color '#ff0000'; use a token (prop or var(--beckui--colors-…))",
      "packages/react/src/components/Dot.tsx:1  [must] literal color 'rgb(0, 0, 0)'; use a token (prop or var(--beckui--colors-…))",
    ],
    valid: {
      'apps/next-example/app/Badge.tsx': `export const badgeColor = 'var(--beckui--colors-primary)';\n`,
      'src/theme.ts': `export const brand = '#ff0000';\n`,
    },
  },
  {
    rule: 'building-with-becket § 3',
    invalid: {
      'apps/next-example/app/Box.tsx': `export const boxClass = 'beckui--button';
export const boxGap = '12px';
`,
    },
    expect: [
      "apps/next-example/app/Box.tsx:1  [must] 'beckui--button': .beckui--* classes are generated, not API",
      "apps/next-example/app/Box.tsx:2  [must] raw length '12px'; use a size prop or var(--beckui--spacing-…)",
    ],
    valid: {
      'apps/next-example/app/Box.tsx': `export const boxGap = 'var(--beckui--spacing-md)';
export const boxRule = 'var(--beckui--colors-border)';
`,
    },
  },
  {
    rule: 'building-with-becket § 2 Known gaps / § 11',
    invalid: {
      'apps/next-example/app/Gap.tsx': `import { Box } from '@becket-ui/react';
export const Gap = () => <Box style={{ flexGrow: 1 }} />;
`,
    },
    expect: [
      'apps/next-example/app/Gap.tsx:2  [must] inline style without a `// TODO (MAV-…)` naming the gap it covers',
    ],
    valid: {
      'apps/next-example/app/Gap.tsx': `import { Box } from '@becket-ui/react';
// TODO (MAV-90): Box has no grow prop yet.
export const Gap = () => <Box style={{ flexGrow: 1 }} />;
`,
    },
  },
  {
    rule: 'building-with-becket § 2 Must use a Becket component when one exists',
    invalid: {
      'apps/next-example/app/Intro.tsx': `export const Intro = () => (
  <section>
    <h2>Hi</h2>
    <button type="button">Go</button>
  </section>
);
`,
    },
    expect: [
      'apps/next-example/app/Intro.tsx:3  [must] <h2>; use Heading as="h2"',
      'apps/next-example/app/Intro.tsx:4  [must] <button>; use Button',
    ],
    valid: {
      'src/Intro.tsx': `export const Intro = () => <h2>Library code may use raw elements</h2>;\n`,
    },
  },
  {
    rule: 'CODING-STYLE § Prefer sorted imports',
    invalid: {
      'src/imports.ts': `import { a } from './a';\nimport { b } from 'b';\nexport const ab = [a, b];\n`,
    },
    expect: [
      'src/imports.ts:2  [prefer] a package import after a relative one; third-party, then absolute, then relative',
    ],
    valid: {
      'src/imports.ts': `import { b } from 'b';\n\nimport { a } from './a';\nexport const ab = [a, b];\n`,
    },
  },
  {
    rule: 'CODING-STYLE § Must explain when ignoring a lint or TypeScript rule',
    invalid: {
      'src/ignore.ts': `// @ts-ignore
export const value: number = 'x';
// eslint-disable-next-line no-console
console.log(value);
`,
    },
    expect: [
      'src/ignore.ts:1  [must] ignore without a comment above saying why',
      'src/ignore.ts:1  [prefer] @ts-ignore; use @ts-expect-error so it fails once the error is gone',
      'src/ignore.ts:3  [must] ignore without a comment above saying why',
    ],
    valid: {
      'src/ignore.ts': `// The fixture's type is wrong upstream.
// @ts-expect-error
export const value: number = 'x';
// Debug output for the demo page.
// eslint-disable-next-line no-console
console.log(value);
`,
    },
  },
  {
    rule: 'becket-guides § Kept on purpose',
    invalid: { 'src/kept.ts': `// style-check keep\nexport const kept = 1;\n` },
    expect: [
      'src/kept.ts:1  [must] `style-check keep` without a reason: // style-check keep: <why the guide allows it>',
    ],
    valid: {
      'src/kept.ts': `// style-check keep: a reason the guide accepts\nexport const kept = 1;\n`,
    },
  },
  {
    rule: 'CODING-STYLE § TODO comments must have a ticket number',
    invalid: { 'src/todo.ts': `// TODO: replace with Container\nexport const width = 1;\n` },
    expect: ['src/todo.ts:1  [must] TODO without a ticket: // TODO (MAV-123): …'],
    valid: {
      'src/todo.ts': `// TODO (MAV-90): replace with Container
// Prose that mentions a TODO list isn't a to-do.
export const width = 1;
`,
    },
  },
  {
    rule: 'becket.mdc § Storybook rules',
    invalid: {
      'packages/react/src/components/Chip.tsx': `export const Chip = () => null;\n`,
      'packages/react/src/components/Pill.tsx': `export const Pill = () => null;\n`,
      'packages/react/src/components/Pill.stories.tsx': `export default { title: 'Widgets/Pill' };\n`,
    },
    expect: [
      'packages/react/src/components/Chip.tsx:1  [must] no Chip.stories.tsx next to the component',
      'packages/react/src/components/Pill.stories.tsx:1  [prefer] story group "Widgets" isn\'t one of Layout, Typography, Buttons, Forms, Overlays, Disclosure, Feedback, Data Display, Navigation',
    ],
    valid: {
      'packages/react/src/components/Pill.tsx': `export const Pill = () => null;\n`,
      'packages/react/src/components/Pill.stories.tsx': `export default { title: 'Navigation/Pill' };\n`,
    },
  },
];

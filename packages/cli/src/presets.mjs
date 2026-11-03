// A preset is a list of rule ids; each builds on the one before (spec: Becket CLI, "Shape").
const codingStyle = [
  'hasty-abstraction',
  'cast-reason',
  'as-const-reason',
  'no-mutation',
  'constant-names',
  'boolean-names',
  'no-get-prefix',
  'initialisms',
  'object-parameters',
  'no-any',
  'no-enums',
  'no-else-after-return',
  'stable-keys',
  'handler-names',
  'effects-review',
  'sorted-imports',
  'explain-ignores',
  'keep-reason',
  'todo-ticket',
];
const becket = [
  ...codingStyle,
  'literal-colors',
  'becket-tokens',
  'inline-style-gap',
  'becket-components',
];

export const presets = {
  // Any React or TypeScript project: docs/CODING-STYLE.md.
  'coding-style': codingStyle,
  // Apps built with Becket: plus packages/react/guides/building-with-becket.md.
  becket,
  // The Becket repo: plus .cursor-config/becket.mdc.
  'becket-library': [...becket, 'storybook'],
};

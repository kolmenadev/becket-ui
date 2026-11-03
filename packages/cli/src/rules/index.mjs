// Every rule, in the order the checker runs them. Findings on the same line are reported in this
// order, so it matches the one-file checker the report snapshot was taken from (MAV-171).
import asConstReason from './as-const-reason.mjs';
import becketComponents from './becket-components.mjs';
import becketTokens from './becket-tokens.mjs';
import booleanNames from './boolean-names.mjs';
import castReason from './cast-reason.mjs';
import constantNames from './constant-names.mjs';
import effectsReview from './effects-review.mjs';
import explainIgnores from './explain-ignores.mjs';
import handlerNames from './handler-names.mjs';
import hastyAbstraction from './hasty-abstraction.mjs';
import initialisms from './initialisms.mjs';
import inlineStyleGap from './inline-style-gap.mjs';
import keepReason from './keep-reason.mjs';
import literalColors from './literal-colors.mjs';
import noAny from './no-any.mjs';
import noElseAfterReturn from './no-else-after-return.mjs';
import noEnums from './no-enums.mjs';
import noGetPrefix from './no-get-prefix.mjs';
import noMutation from './no-mutation.mjs';
import objectParameters from './object-parameters.mjs';
import sortedImports from './sorted-imports.mjs';
import stableKeys from './stable-keys.mjs';
import storybook from './storybook.mjs';
import todoTicket from './todo-ticket.mjs';

export const rules = [
  hastyAbstraction,
  castReason,
  asConstReason,
  noMutation,
  constantNames,
  booleanNames,
  noGetPrefix,
  initialisms,
  objectParameters,
  noAny,
  noEnums,
  noElseAfterReturn,
  stableKeys,
  handlerNames,
  effectsReview,
  literalColors,
  becketTokens,
  inlineStyleGap,
  becketComponents,
  sortedImports,
  explainIgnores,
  keepReason,
  todoTicket,
  storybook,
];

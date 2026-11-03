// `.sort()`, `.reverse()` and `.splice()` change the array in place.
export default {
  id: 'no-mutation',
  guide: 'CODING-STYLE § Must not mutate arrays or objects you don’t own',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      // Scoped by the method's line rather than the chain's first, so a `.sort()` added under an
      // unchanged line is still caught, and its annotation and keep marker sit next to it.
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ['sort', 'reverse', 'splice'].includes(node.expression.name.text) &&
        inScope(node.expression.name)
      )
        report({
          node: node.expression.name,
          level: 'prefer',
          message: `.${node.expression.name.text}() mutates in place; use .${{ sort: 'toSorted', reverse: 'toReversed', splice: 'toSpliced' }[node.expression.name.text]}()`,
        });
    },
  }),
};

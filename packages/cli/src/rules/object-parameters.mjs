// More than two parameters: pass one object.
export default {
  id: 'object-parameters',
  guide: 'CODING-STYLE § Prefer object parameters when there are more than 2',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isFunctionLike(node) &&
        node.parameters?.length > 2 &&
        // A callback's signature is set by whoever calls it (Array methods, Node's `lookup` option).
        !ts.isCallExpression(node.parent) &&
        !ts.isPropertyAssignment(node.parent)
      )
        report({
          node,
          level: 'prefer',
          message: `${node.parameters.length} positional parameters; pass one object`,
        });
    },
  }),
};

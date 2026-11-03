// Props are `onX`; the functions that handle them are `handleX`.
export default {
  id: 'handler-names',
  guide: 'CODING-STYLE § Name props onX and handlers handleX',
  check: ({ ts, file, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        // Handlers live in components, so only JSX files have them.
        /\.[jt]sx$/.test(file) &&
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        /^on[A-Z]/.test(node.name.text) &&
        node.initializer &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
      )
        report({
          node,
          level: 'must',
          message: `${node.name.text}: a handler inside a component is handle${node.name.text.slice(2)}`,
        });
    },
  }),
};

// `get` says nothing: almost every function returns something.
export default {
  id: 'no-get-prefix',
  guide: 'CODING-STYLE § Avoid implied keywords in function names',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        (ts.isFunctionDeclaration(node) ||
          (ts.isVariableDeclaration(node) &&
            node.initializer &&
            (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)))) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        /^get[A-Z]/.test(node.name.text)
      )
        report({
          node,
          level: 'must',
          message: `${node.name.text}: drop the get prefix and name what it does (select, find, format, to…)`,
        });
    },
  }),
};

// UPPER_SNAKE_CASE is for environment variables only.
export default {
  id: 'constant-names',
  guide: 'CODING-STYLE § Name consistency',
  check: ({ ts, source, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        // Loop and catch variables aren't constants.
        !ts.isCatchClause(node.parent) &&
        !ts.isForOfStatement(node.parent.parent) &&
        !ts.isForInStatement(node.parent.parent) &&
        !ts.isForStatement(node.parent.parent) &&
        /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$|^[A-Z]{2,}[0-9]*$/.test(node.name.text) &&
        !/process\.env|import\.meta\.env/.test(node.initializer?.getText(source) ?? '')
      )
        report({
          node,
          level: 'must',
          message: `${node.name.text}: UPPER_SNAKE_CASE is for environment variables; use camelCase`,
        });
    },
  }),
};

// An `else` after a return or throw only adds nesting.
export default {
  id: 'no-else-after-return',
  guide: 'CODING-STYLE § Prefer to reduce nesting',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isIfStatement(node) &&
        node.elseStatement &&
        (ts.isReturnStatement(node.thenStatement) ||
          (ts.isBlock(node.thenStatement) &&
            node.thenStatement.statements.at(-1) &&
            (ts.isReturnStatement(node.thenStatement.statements.at(-1)) ||
              ts.isThrowStatement(node.thenStatement.statements.at(-1)))))
      )
        report({
          node: node.elseStatement,
          level: 'prefer',
          message: '`else` after a return or throw; drop the else and un-indent',
        });
    },
  }),
};

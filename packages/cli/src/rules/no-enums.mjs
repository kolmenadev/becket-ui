// String unions and `as const` are plain JavaScript; enums aren't.
export default {
  id: 'no-enums',
  guide: 'CODING-STYLE § Prefer unions and as const over enums',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (inScope(node) && ts.isEnumDeclaration(node))
        report({
          node,
          level: 'prefer',
          message: `enum ${node.name.text}; use a string union or an \`as const\` array`,
        });
    },
  }),
};

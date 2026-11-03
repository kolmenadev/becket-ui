// An index key breaks when a list reorders, filters or grows.
export default {
  id: 'stable-keys',
  guide: 'CODING-STYLE § Must use stable keys',
  check: ({ ts, source, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isJsxAttribute(node) &&
        node.name.getText(source) === 'key' &&
        /\b(index|idx|i)\b/.test(node.initializer?.getText(source) ?? '')
      )
        report({
          node,
          level: 'must',
          message: `key=${node.initializer.getText(source)}; use a stable ID from the data`,
        });
    },
  }),
};

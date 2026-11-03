// An inline style in app code covers a gap in Becket, and names it with a ticket.
export default {
  id: 'inline-style-gap',
  guide: 'building-with-becket § 2 Known gaps / § 11',
  check: ({ ts, source, text, isAppCode, inScope, lineOf, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        isAppCode &&
        ts.isJsxAttribute(node) &&
        node.name.getText(source) === 'style' &&
        !/TODO \(MAV-\d+\)/.test(text.slice(Math.max(0, lineOf(node) - 3), lineOf(node)).join('\n'))
      )
        report({
          node,
          level: 'must',
          message: 'inline style without a `// TODO (MAV-…)` naming the gap it covers',
        });
    },
  }),
};

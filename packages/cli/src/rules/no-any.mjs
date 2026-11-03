// `any` turns off type checking downstream, so no reason can keep it.
export default {
  id: 'no-any',
  guide: 'CODING-STYLE § Must not use any',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (inScope(node) && node.kind === ts.SyntaxKind.AnyKeyword)
        report({
          node,
          level: 'must',
          message:
            '`any` (and `as any`, even with a comment); use `unknown` and narrow it, or write the real type',
          isKeepable: false,
        });
    },
  }),
};

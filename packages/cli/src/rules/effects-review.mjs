// Effects are for syncing with something outside React; a person decides whether this one is.
export default {
  id: 'effects-review',
  guide: 'CODING-STYLE § Use effects only to sync with something outside React',
  check: ({ ts, source, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isCallExpression(node) &&
        /^(React\.)?(useEffect|useLayoutEffect)$/.test(node.expression.getText(source))
      )
        report({
          node,
          level: 'review',
          message:
            'an effect: confirm it syncs with something outside React (not derived state or an event)',
        });
    },
  }),
};

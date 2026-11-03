// App code and components use color tokens, never literal colors.
export default {
  id: 'literal-colors',
  guide: 'building-with-becket § 3 / becket.mdc § Styling',
  check: ({ ts, source, isAppCode, isComponent, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        (isAppCode || isComponent) &&
        (ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateExpression(node)) &&
        /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch)\(/i.test(node.getText(source))
      )
        report({
          node,
          level: 'must',
          message: `literal color ${node.getText(source).slice(0, 40)}; use a token (prop or var(--beckui--colors-…))`,
        });
    },
  }),
};

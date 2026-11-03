// Props, then tokens: no generated `.beckui--*` classes, and no raw lengths in app code.
export default {
  id: 'becket-tokens',
  guide: 'building-with-becket § 3',
  check: ({ ts, source, isAppCode, isComponent, inScope, report }) => ({
    visit(node) {
      if (
        !inScope(node) ||
        !(isAppCode || isComponent) ||
        !(
          ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateExpression(node)
        )
      )
        return;
      const value = node.getText(source);
      if (
        /\.?beckui--(?!colors|spacing|sizes|radii|font|shadows|gradients|z|line|letter|border|easings|durations)/.test(
          value,
        )
      )
        report({
          node,
          level: 'must',
          message: `${value.slice(0, 40)}: .beckui--* classes are generated, not API`,
        });
      if (isAppCode && /\b\d*\.?\d+(px|rem|em)\b/.test(value) && !/var\(--beckui--/.test(value))
        report({
          node,
          level: 'must',
          message: `raw length ${value.slice(0, 40)}; use a size prop or var(--beckui--spacing-…)`,
        });
    },
  }),
};

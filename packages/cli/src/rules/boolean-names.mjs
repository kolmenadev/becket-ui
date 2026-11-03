// useState(false) → [isOpen, setIsOpen]
export default {
  id: 'boolean-names',
  guide: 'CODING-STYLE § Name consistency › Boolean',
  check: ({ ts, source, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        ts.isVariableDeclaration(node) &&
        ts.isArrayBindingPattern(node.name) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        /^(React\.)?useState$/.test(node.initializer.expression.getText(source)) &&
        /^(true|false)$/.test(node.initializer.arguments[0]?.getText(source) ?? '') &&
        !/^(is|has|does|should|can)[A-Z]/.test(node.name.elements[0]?.getText(source) ?? '') &&
        // The guide's exception: state that mirrors a design-system or HTML boolean prop keeps its
        // name.
        ![
          'open',
          'checked',
          'disabled',
          'invalid',
          'required',
          'selected',
          'expanded',
          'pressed',
          'hidden',
          'readOnly',
          'multiple',
          'indeterminate',
        ].includes(node.name.elements[0]?.getText(source))
      )
        report({
          node,
          level: 'must',
          message: `${node.name.elements[0].getText(source)}: booleans start with is, has, does, should or can`,
        });
    },
  }),
};

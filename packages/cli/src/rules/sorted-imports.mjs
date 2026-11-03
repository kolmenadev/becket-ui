// Third-party, then outer (absolute) modules, then inner (relative) ones.
export default {
  id: 'sorted-imports',
  guide: 'CODING-STYLE § Prefer sorted imports',
  check: ({ ts, source, inScope, report }) => ({
    finish() {
      let sawRelative = false;
      for (const statement of source.statements.filter(ts.isImportDeclaration)) {
        const isRelative = statement.moduleSpecifier.getText(source).slice(1).startsWith('.');
        if (sawRelative && !isRelative && inScope(statement))
          report({
            node: statement,
            level: 'prefer',
            message:
              'a package import after a relative one; third-party, then absolute, then relative',
          });
        sawRelative ||= isRelative;
      }
    },
  }),
};

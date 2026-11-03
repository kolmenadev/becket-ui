// `as …` and `!` need a comment saying why.
export default {
  id: 'cast-reason',
  guide: 'CODING-STYLE § Prefer inference inside, explicit types at boundaries',
  check: ({ ts, source, text, lines, lineOf, report }) => ({
    visit(node) {
      if (!(
        (ts.isAsExpression(node) && node.type.getText(source) !== 'const') ||
        ts.isNonNullExpression(node)
      ))
        return;
      // `as …` and `!` are written where the expression ends, so a cast added to the last line of
      // a multi-line array or object is in scope even when the expression's first line isn't.
      const castLine = source.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      // A reason is a comment on the cast's line or its first line, right above either, or right
      // above its statement. Inside JSX the only comment is `{/* … */}`.
      let statement = node;
      while (statement.parent && !ts.isStatement(statement) && !ts.isPropertyAssignment(statement))
        statement = statement.parent;
      if (
        (lines === null || lines.has(castLine) || lines.has(lineOf(node))) &&
        ![castLine, lineOf(node)].some((line) => /\/\/|\/\*/.test(text[line - 1])) &&
        ![castLine, lineOf(node), lineOf(statement)].some((line) =>
          /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(text[line - 2] ?? ''),
        )
      )
        report({
          line: castLine,
          level: 'must',
          message: `${ts.isAsExpression(node) ? `\`as ${node.type.getText(source)}\`` : '`!`'} without a comment saying why`,
        });
    },
  }),
};

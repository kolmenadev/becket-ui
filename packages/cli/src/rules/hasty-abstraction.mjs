// Names used once, aliases, and helpers below the Rule of 3.
export default {
  id: 'hasty-abstraction',
  guide: 'CODING-STYLE § Avoid hasty abstraction',
  check: ({ ts, checker, source, inScope, lineOf, report }) => {
    // Every named declaration in scope that the guide counts as an abstraction, with its uses.
    const declarations = [];
    const references = new Map();
    return {
      visit(node) {
        if (
          ((ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            // Loop and catch variables aren't abstractions.
            !ts.isCatchClause(node.parent) &&
            !ts.isForOfStatement(node.parent.parent) &&
            !ts.isForInStatement(node.parent.parent) &&
            !ts.isForStatement(node.parent.parent)) ||
            (ts.isFunctionDeclaration(node) && node.name) ||
            ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            (ts.isClassDeclaration(node) && node.name)) &&
          inScope(node) &&
          !(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) &&
          !(
            ts.isVariableDeclaration(node) &&
            node.parent.parent.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
          )
        )
          declarations.push(node);

        if (ts.isIdentifier(node)) {
          const symbol = ts.isShorthandPropertyAssignment(node.parent)
            ? checker.getShorthandAssignmentValueSymbol(node.parent)
            : checker.getSymbolAtLocation(node);
          // `{ color }` both names a property and uses the variable.
          if (
            symbol &&
            !(node.parent.name === node && !ts.isShorthandPropertyAssignment(node.parent))
          )
            references.set(symbol, [...(references.get(symbol) ?? []), node]);
        }
      },

      finish() {
        for (const declaration of declarations) {
          const symbol = checker.getSymbolAtLocation(declaration.name);
          const uses = (references.get(symbol) ?? []).filter(
            (use) => !(use.pos >= declaration.pos && use.end <= declaration.end),
          );
          // Recursion and `export { name }` are reasons to keep a name.
          if ((references.get(symbol) ?? []).length > uses.length) continue;
          if (uses.some((use) => ts.isExportSpecifier(use.parent))) continue;
          const name = declaration.name.text;
          const initializer = declaration.initializer;
          if (uses.length === 0) {
            report({ node: declaration, level: 'must', message: `${name}: declared, never used` });
            continue;
          }
          if (
            initializer &&
            (ts.isIdentifier(initializer) ||
              (ts.isPropertyAccessExpression(initializer) &&
                /^[\w$.?]+$/.test(initializer.getText(source)))) &&
            uses.length <= 2
          ) {
            report({
              node: declaration,
              level: 'must',
              message: `${name}: alias of \`${initializer.getText(source)}\`, used ${uses.length}×; write \`${initializer.getText(source)}\` where it's used`,
            });
            continue;
          }
          if (
            uses.length === 2 &&
            (ts.isFunctionDeclaration(declaration) ||
              ts.isTypeAliasDeclaration(declaration) ||
              ts.isInterfaceDeclaration(declaration) ||
              ts.isClassDeclaration(declaration) ||
              (initializer &&
                (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))))
          ) {
            report({
              node: declaration,
              level: 'must',
              message: `${name}: helper used 2× (lines ${uses.map(lineOf).join(', ')}); the guide abstracts at the third copy, so write it out at each use or restructure so it's needed once`,
            });
            continue;
          }
          if (uses.length !== 1) continue;
          // Inlining into a loop or callback re-runs the work; flag it so the fix checks for that.
          // A loop's header runs once; only its body (and a callback's body) repeats.
          let [child, node] = [uses[0], uses[0].parent];
          let crossesBoundary = false;
          while (node && !(declaration.pos >= node.pos && declaration.end <= node.end)) {
            if (
              ts.isFunctionLike(node) ||
              (ts.isIterationStatement(node, false) && child === node.statement)
            )
              crossesBoundary = true;
            [child, node] = [node, node.parent];
          }
          report({
            node: declaration,
            level: 'must',
            message: `${name}: used once (line ${lineOf(uses[0])}); inline it${crossesBoundary ? ' (the use is inside a loop or callback: keep it only if inlining would repeat real work, and say so in a comment)' : ''}`,
          });
        }
      },
    };
  },
};

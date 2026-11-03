// Initialisms keep one case: `userID`, never `userId`.
export default {
  id: 'initialisms',
  guide: 'CODING-STYLE § Initialisms',
  check: ({ ts, inScope, report }) => ({
    visit(node) {
      if (
        inScope(node) &&
        (ts.isFunctionDeclaration(node) ||
          ts.isVariableDeclaration(node) ||
          ts.isTypeAliasDeclaration(node) ||
          ts.isInterfaceDeclaration(node) ||
          ts.isParameter(node) ||
          ts.isPropertySignature(node)) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        /[a-z0-9](Url|Uri|Id|Ids|Html|Json|Api|Css|Svg|Pdf|Http|Xml)(?=[A-Z]|$)/.test(
          node.name.text,
        )
      )
        report({
          node,
          level: 'must',
          message: `${node.name.text}: initialisms keep one case (userID, inviteURL, parseHTML)`,
        });
    },
  }),
};

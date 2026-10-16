#!/usr/bin/env node
/**
 * The mechanical half of Becket's guides. The becket-guides skill covers the half a script can't
 * judge. Rules come from docs/CODING-STYLE.md, packages/react/guides/building-with-becket.md and
 * .cursor-config/becket.mdc. When a guide changes, change the check here to match the guide.
 *
 *   node style-check.mjs --paths <file|folder>…   every line of those files
 *   node style-check.mjs --all                    every tracked source file
 *   node style-check.mjs --base main              lines added since main (the default)
 *   node style-check.mjs --staged                 lines added in the index
 *   node style-check.mjs --hook                   Claude Code PreToolUse gate for `git commit`
 *   add --repo <dir> to check another checkout
 *
 * Exit 1 on any finding. The hook blocks a commit the first time it sees a set of findings and
 * passes the same set on the next try, so a name kept on purpose (with its reason) can't block forever.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
let [repo, base] = [
  ['--repo', process.cwd()],
  ['--base', 'main'],
].map(([name, fallback]) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback));
let mode = ['--all', '--paths', '--staged'].find((flag) => args.includes(flag))?.slice(2) ?? 'base';

if (args.includes('--hook')) {
  const event = JSON.parse(readFileSync(0, 'utf8'));
  const command = event.tool_input?.command ?? '';
  if (!/\bgit\b(?:\s+-C\s+\S+)?\s+commit\b/.test(command)) process.exit(0);
  // Commits run as `cd <checkout> && git commit …` or `git -C <checkout> commit …`.
  repo = resolve(
    event.cwd ?? process.cwd(),
    (
      command.match(/\bcd\s+("[^"]+"|'[^']+'|\S+)\s*&&/)?.[1] ??
      command.match(/\bgit\s+-C\s+("[^"]+"|'[^']+'|\S+)/)?.[1] ??
      '.'
    ).replace(/^["']|["']$/g, ''),
  );
  // `commit -a` stages tracked changes at commit time, so check the working tree instead.
  mode = /\bcommit\b[^|;&]*\s-[a-zA-Z]*a/.test(command) ? 'head' : 'staged';
  base = 'HEAD';
}

const git = (...gitArgs) =>
  execFileSync('git', ['-C', repo, ...gitArgs], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
repo = git('rev-parse', '--show-toplevel').trim();

// Which lines of which files to check: every line (null) or only the lines a diff adds.
const scope = new Map();
if (mode === 'all' || mode === 'paths') {
  // The paths after --paths, up to the next flag; none means the whole repo (--all).
  const paths = mode === 'paths' ? args.slice(args.indexOf('--paths') + 1) : [];
  for (const file of git(
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    ...paths
      .slice(0, paths.findIndex((arg) => arg.startsWith('--')) + 1 || paths.length)
      .filter((path) => !path.startsWith('--'))
      .map((path) => resolve(path)),
  ).split('\n'))
    if (file && existsSync(join(repo, file))) scope.set(file, null);
} else {
  let lines;
  for (const line of git(
    'diff',
    '-U0',
    '--diff-filter=AM',
    ...{ staged: ['--cached'], head: ['HEAD'], base: [`${base}...HEAD`] }[mode],
  ).split('\n')) {
    if (line.startsWith('+++ ')) {
      lines = new Set();
      scope.set(line.slice(6), lines);
    }
    const hunk = line.match(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/);
    for (let offset = 0; hunk && offset < Number(hunk[2] ?? 1); offset += 1)
      lines.add(Number(hunk[1]) + offset);
  }
}
// Generated or vendored code isn't written by hand, so the guides don't apply to it.
for (const file of scope.keys()) {
  if (
    !/\.(tsx?|mjs|cjs|js)$/.test(file) ||
    file.endsWith('.d.ts') ||
    /(^|\/)(dist|styled-system|node_modules|storybook-static|\.next)\//.test(file)
  )
    scope.delete(file);
}
if (scope.size === 0) process.exit(0);

// The classic compiler API (symbols and a checker): TypeScript 7's package doesn't expose it.
const ts = createRequire(join(repo, 'packages/tokens/package.json'))('@typescript/typescript6');
const contents = new Map(
  [...scope.keys()].map((file) => [
    join(repo, file),
    mode === 'staged' ? git('show', `:${file}`) : readFileSync(join(repo, file), 'utf8'),
  ]),
);
const options = {
  allowJs: true,
  noResolve: true,
  noEmit: true,
  target: ts.ScriptTarget.ESNext,
  jsx: ts.JsxEmit.Preserve,
};
const host = ts.createCompilerHost(options);
host.readFile = (path) => contents.get(path) ?? ts.sys.readFile(path);
host.fileExists = (path) => contents.has(path) || existsSync(path);
const program = ts.createProgram([...contents.keys()], options, host);
const checker = program.getTypeChecker();

const findings = [];
for (const [file, lines] of scope) {
  const source = program.getSourceFile(join(repo, file));
  const text = source.getFullText().split('\n');
  const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const inScope = (node) => lines === null || lines.has(lineOf(node));
  const report = ({ node, line = lineOf(node), level, rule, message }) =>
    findings.push({ file, line, level, rule, message });
  // App code: written with Becket rather than in it (building-with-becket.md).
  const isAppCode = /\.examples\.tsx$/.test(file) || file.startsWith('apps/next-example/');
  const isComponent =
    /^packages\/react\/src\/components\/.*\.tsx$/.test(file) &&
    !/\.(stories|test|examples)\.tsx$/.test(file);

  // Every named declaration in scope that the guide counts as an abstraction, with its uses.
  const declarations = [];
  const references = new Map();
  const visit = (node) => {
    const isLoopOrCatchVariable =
      ts.isVariableDeclaration(node) &&
      (ts.isCatchClause(node.parent) ||
        ts.isForOfStatement(node.parent.parent) ||
        ts.isForInStatement(node.parent.parent) ||
        ts.isForStatement(node.parent.parent));
    if (
      ((ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && !isLoopOrCatchVariable) ||
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
      if (symbol && !(node.parent.name === node && !ts.isShorthandPropertyAssignment(node.parent)))
        references.set(symbol, [...(references.get(symbol) ?? []), node]);
    }

    if (!inScope(node)) return ts.forEachChild(node, visit);

    // docs/CODING-STYLE.md: naming.
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && !isLoopOrCatchVariable) {
      if (
        /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$|^[A-Z]{2,}[0-9]*$/.test(node.name.text) &&
        !/process\.env|import\.meta\.env/.test(node.initializer?.getText(source) ?? '')
      )
        report({
          node,
          level: 'must',
          rule: 'CODING-STYLE § Name consistency',
          message: `${node.name.text}: UPPER_SNAKE_CASE is for environment variables; use camelCase`,
        });
    }
    // useState(false) → [isOpen, setIsOpen]
    if (
      ts.isVariableDeclaration(node) &&
      ts.isArrayBindingPattern(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      /^(React\.)?useState$/.test(node.initializer.expression.getText(source)) &&
      /^(true|false)$/.test(node.initializer.arguments[0]?.getText(source) ?? '') &&
      !/^(is|has|does|should|can)[A-Z]/.test(node.name.elements[0]?.getText(source) ?? '') &&
      // The guide's exception: state that mirrors a design-system or HTML boolean prop keeps its name.
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
        rule: 'CODING-STYLE § Name consistency › Boolean',
        message: `${node.name.elements[0].getText(source)}: booleans start with is, has, does, should or can`,
      });
    const declaredName =
      (ts.isFunctionDeclaration(node) ||
        ts.isVariableDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isParameter(node) ||
        ts.isPropertySignature(node)) &&
      node.name &&
      ts.isIdentifier(node.name)
        ? node.name.text
        : null;
    if (
      declaredName &&
      /^get[A-Z]/.test(declaredName) &&
      (ts.isFunctionDeclaration(node) ||
        (ts.isVariableDeclaration(node) &&
          node.initializer &&
          (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))))
    )
      report({
        node,
        level: 'must',
        rule: 'CODING-STYLE § Avoid implied keywords in function names',
        message: `${declaredName}: drop the get prefix and name what it does (select, find, format, to…)`,
      });
    if (
      declaredName &&
      /[a-z0-9](Url|Uri|Id|Ids|Html|Json|Api|Css|Svg|Pdf|Http|Xml)(?=[A-Z]|$)/.test(declaredName)
    )
      report({
        node,
        level: 'must',
        rule: 'CODING-STYLE § Initialisms',
        message: `${declaredName}: initialisms keep one case (userID, inviteURL, parseHTML)`,
      });
    if (
      ts.isFunctionLike(node) &&
      node.parameters?.length > 2 &&
      // A callback's signature is set by whoever calls it (Array methods, Node's `lookup` option).
      !ts.isCallExpression(node.parent) &&
      !ts.isPropertyAssignment(node.parent)
    )
      report({
        node,
        level: 'prefer',
        rule: 'CODING-STYLE § Prefer object parameters when there are more than 2',
        message: `${node.parameters.length} positional parameters; pass one object`,
      });

    // docs/CODING-STYLE.md: TypeScript.
    if (node.kind === ts.SyntaxKind.AnyKeyword)
      report({
        node,
        level: 'must',
        rule: 'CODING-STYLE § Must not use any',
        message: '`any`; use `unknown` and narrow it, or write the real type',
      });
    if (ts.isEnumDeclaration(node))
      report({
        node,
        level: 'prefer',
        rule: 'CODING-STYLE § Prefer unions and as const over enums',
        message: `enum ${node.name.text}; use a string union or an \`as const\` array`,
      });
    if (
      (ts.isAsExpression(node) &&
        !(ts.isTypeReferenceNode(node.type) && node.type.typeName.getText(source) === 'const')) ||
      ts.isNonNullExpression(node)
    ) {
      // A reason is a comment on the same line, right above the cast, or right above its statement.
      let statement = node;
      while (statement.parent && !ts.isStatement(statement) && !ts.isPropertyAssignment(statement))
        statement = statement.parent;
      if (
        !/\/\/|\/\*/.test(text[lineOf(node) - 1]) &&
        ![lineOf(node), lineOf(statement)].some((line) =>
          /^\s*(\/\/|\*|\/\*)/.test(text[line - 2] ?? ''),
        )
      )
        report({
          node,
          level: 'must',
          rule: 'CODING-STYLE § Prefer inference inside, explicit types at boundaries',
          message: `${ts.isAsExpression(node) ? `\`as ${node.type.getText(source)}\`` : '`!`'} without a comment saying why`,
        });
    }

    // docs/CODING-STYLE.md: mutation, nesting.
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ['sort', 'reverse', 'splice'].includes(node.expression.name.text)
    )
      report({
        node,
        level: 'prefer',
        rule: 'CODING-STYLE § Must not mutate arrays or objects you don’t own',
        message: `.${node.expression.name.text}() mutates in place; use .${{ sort: 'toSorted', reverse: 'toReversed', splice: 'toSpliced' }[node.expression.name.text]}()`,
      });
    if (
      ts.isIfStatement(node) &&
      node.elseStatement &&
      (ts.isReturnStatement(node.thenStatement) ||
        (ts.isBlock(node.thenStatement) &&
          node.thenStatement.statements.at(-1) &&
          (ts.isReturnStatement(node.thenStatement.statements.at(-1)) ||
            ts.isThrowStatement(node.thenStatement.statements.at(-1)))))
    )
      report({
        node: node.elseStatement,
        level: 'prefer',
        rule: 'CODING-STYLE § Prefer to reduce nesting',
        message: '`else` after a return or throw; drop the else and un-indent',
      });

    // docs/CODING-STYLE.md: React.
    if (
      ts.isJsxAttribute(node) &&
      node.name.getText(source) === 'key' &&
      /\b(index|idx|i)\b/.test(node.initializer?.getText(source) ?? '')
    )
      report({
        node,
        level: 'must',
        rule: 'CODING-STYLE § Must use stable keys',
        message: `key=${node.initializer.getText(source)}; use a stable ID from the data`,
      });
    if (
      // Handlers live in components, so only JSX files have them.
      /\.[jt]sx$/.test(file) &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /^on[A-Z]/.test(node.name.text) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    )
      report({
        node,
        level: 'must',
        rule: 'CODING-STYLE § Name props onX and handlers handleX',
        message: `${node.name.text}: a handler inside a component is handle${node.name.text.slice(2)}`,
      });
    if (
      ts.isCallExpression(node) &&
      /^(React\.)?(useEffect|useLayoutEffect)$/.test(node.expression.getText(source))
    )
      report({
        node,
        level: 'review',
        rule: 'CODING-STYLE § Use effects only to sync with something outside React',
        message:
          'an effect: confirm it syncs with something outside React (not derived state or an event)',
      });

    // building-with-becket.md and becket.mdc: tokens, never literals.
    if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateExpression(node)) &&
      (isAppCode || isComponent)
    ) {
      const value = node.getText(source);
      if (/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch)\(/i.test(value))
        report({
          node,
          level: 'must',
          rule: 'building-with-becket § 3 / becket.mdc § Styling',
          message: `literal color ${value.slice(0, 40)}; use a token (prop or var(--beckui--colors-…))`,
        });
      if (
        /\.?beckui--(?!colors|spacing|sizes|radii|font|shadows|gradients|z|line|letter|border|easings|durations)/.test(
          value,
        )
      )
        report({
          node,
          level: 'must',
          rule: 'building-with-becket § 3',
          message: `${value.slice(0, 40)}: .beckui--* classes are generated, not API`,
        });
      if (isAppCode && /\b\d*\.?\d+(px|rem|em)\b/.test(value) && !/var\(--beckui--/.test(value))
        report({
          node,
          level: 'must',
          rule: 'building-with-becket § 3',
          message: `raw length ${value.slice(0, 40)}; use a size prop or var(--beckui--spacing-…)`,
        });
    }
    if (isAppCode && ts.isJsxAttribute(node)) {
      if (
        node.name.getText(source) === 'style' &&
        !/TODO \(MAV-\d+\)/.test(text.slice(Math.max(0, lineOf(node) - 3), lineOf(node)).join('\n'))
      )
        report({
          node,
          level: 'must',
          rule: 'building-with-becket § 2 Known gaps / § 11',
          message: 'inline style without a `// TODO (MAV-…)` naming the gap it covers',
        });
    }
    if (isAppCode && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      const tag = node.tagName.getText(source);
      const becket = {
        h1: 'Heading as="h1"',
        h2: 'Heading as="h2"',
        h3: 'Heading as="h3"',
        h4: 'Heading as="h4"',
        h5: 'Heading as="h5"',
        h6: 'Heading as="h6"',
        p: 'Text',
        hr: 'Separator',
        button: 'Button',
        input: 'TextField / Checkbox / Switch',
        select: 'Select',
        textarea: 'Textarea',
        table: 'Table',
        a: 'Link (or Button as="a")',
        img: 'Image',
        ul: 'List',
        ol: 'List as="ol"',
        li: 'ListItem',
        code: 'Code',
        kbd: 'Kbd',
        mark: 'Mark',
        blockquote: 'Blockquote',
        svg: 'Icon',
        div: 'Box / Stack / HStack / Flex / SimpleGrid / Container',
        span: 'Text',
      }[tag];
      if (becket)
        report({
          node,
          level: 'must',
          rule: 'building-with-becket § 2 Must use a Becket component when one exists',
          message: `<${tag}>; use ${becket}`,
        });
    }
    return ts.forEachChild(node, visit);
  };
  visit(source);

  // Avoid hasty abstraction: names used once, aliases, and helpers below the Rule of 3.
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
    const rule = 'CODING-STYLE § Avoid hasty abstraction';
    if (uses.length === 0) {
      report({ node: declaration, level: 'must', rule, message: `${name}: declared, never used` });
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
        rule,
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
        (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))))
    ) {
      report({
        node: declaration,
        level: 'must',
        rule,
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
      rule,
      message: `${name}: used once (line ${lineOf(uses[0])}); inline it${crossesBoundary ? ' (the use is inside a loop or callback: keep it only if inlining would repeat real work, and say so in a comment)' : ''}`,
    });
  }

  // Import order: third-party, then outer (absolute) modules, then inner (relative) ones.
  let sawRelative = false;
  for (const statement of source.statements.filter(ts.isImportDeclaration)) {
    const isRelative = statement.moduleSpecifier.getText(source).slice(1).startsWith('.');
    if (sawRelative && !isRelative && inScope(statement))
      report({
        node: statement,
        level: 'prefer',
        rule: 'CODING-STYLE § Prefer sorted imports',
        message: 'a package import after a relative one; third-party, then absolute, then relative',
      });
    sawRelative ||= isRelative;
  }

  // Real comments only (from the parser): a string or regex that spells a directive doesn't count.
  const comments = new Map();
  const collectComments = (node) => {
    for (const range of [
      ...(ts.getLeadingCommentRanges(source.getFullText(), node.pos) ?? []),
      ...(ts.getTrailingCommentRanges(source.getFullText(), node.end) ?? []),
    ])
      comments.set(range.pos, range);
    ts.forEachChild(node, collectComments);
  };
  collectComments(source);
  collectComments(source.endOfFileToken);
  for (const range of comments.values()) {
    const comment = source.getFullText().slice(range.pos, range.end);
    const line = source.getLineAndCharacterOfPosition(range.pos).line + 1;
    if (lines !== null && !lines.has(line)) continue;
    if (
      /^(\/\/|\/\*)\s*(eslint-disable|@ts-expect-error|@ts-ignore|biome-ignore)/.test(comment) &&
      !/^\s*(\/\/|\*)(?!.*(eslint-disable|@ts-|biome-ignore))/.test(text[line - 2] ?? '')
    )
      report({
        line,
        level: 'must',
        rule: 'CODING-STYLE § Must explain when ignoring a lint or TypeScript rule',
        message: 'ignore without a comment above saying why',
      });
    if (/^(\/\/|\/\*)\s*@ts-ignore/.test(comment))
      report({
        line,
        level: 'prefer',
        rule: 'CODING-STYLE § Must explain when ignoring a lint or TypeScript rule',
        message: '@ts-ignore; use @ts-expect-error so it fails once the error is gone',
      });
    // A to-do starts a comment line (`// TODO …`, ` * TODO …`); prose that mentions one doesn't count.
    if (/(^|\n)\s*(\/\/|\/\*+|\*)\s*TODO\b/.test(comment) && !/TODO \([A-Z]+-\d+\)/.test(comment))
      report({
        line,
        level: 'must',
        rule: 'CODING-STYLE § TODO comments must have a ticket number',
        message: 'TODO without a ticket: // TODO (MAV-123): …',
      });
  }

  // becket.mdc: every component has colocated stories, and stories use the agreed groups.
  if (
    isComponent &&
    lines === null &&
    !existsSync(join(repo, file.replace(/\.tsx$/, '.stories.tsx')))
  )
    report({
      line: 1,
      level: 'must',
      rule: 'becket.mdc § Storybook rules',
      message: `no ${file
        .split('/')
        .at(-1)
        .replace(/\.tsx$/, '.stories.tsx')} next to the component`,
    });
  if (file.endsWith('.stories.tsx')) {
    const title = source.getFullText().match(/title:\s*['"]([^'"/]+)\//);
    if (
      title &&
      ![
        'Layout',
        'Typography',
        'Buttons',
        'Forms',
        'Overlays',
        'Disclosure',
        'Feedback',
        'Data Display',
      ].includes(title[1]) &&
      (lines === null || lines.has(source.getFullText().slice(0, title.index).split('\n').length))
    )
      report({
        line: source.getFullText().slice(0, title.index).split('\n').length,
        level: 'prefer',
        rule: 'becket.mdc § Storybook rules',
        message: `story group "${title[1]}" isn't one of Layout, Typography, Buttons, Forms, Overlays, Disclosure, Feedback, Data Display`,
      });
  }
}

if (findings.length === 0) process.exit(0);
const reportText = [
  `Becket guides check: ${findings.length} finding(s) (${['must', 'prefer', 'review'].map((level) => `${findings.filter((finding) => finding.level === level).length} ${level}`).join(', ')})`,
  ...findings
    .toSorted((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map(
      (finding) =>
        `${finding.file}:${finding.line}  [${finding.level}] ${finding.message}  — ${finding.rule}`,
    ),
].join('\n');

if (!args.includes('--hook')) {
  console.log(reportText);
  process.exit(1);
}
const seenPath = resolve(repo, git('rev-parse', '--git-path', 'becket-guides-seen').trim());
const hash = createHash('sha256').update(reportText).digest('hex');
if (existsSync(seenPath) && readFileSync(seenPath, 'utf8') === hash) process.exit(0);
writeFileSync(seenPath, hash);
console.error(
  `${reportText}\n\nCommit blocked once by the becket-guides check. Fix every finding, restage and commit again. Keep something only for a reason the guide accepts (for names: 3+ uses, recursion, public API, or inlining would change behavior) and write that reason in a comment. "review" items need a look, not necessarily a change. Re-running the same commit unchanged passes.`,
);
process.exit(2);

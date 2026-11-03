import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, matchesGlob } from 'node:path';

import { presets } from './presets.mjs';
import { rules } from './rules/index.mjs';

/**
 * Checks the lines in scope against the rules `config` turns on (see config.mjs).
 *
 *   mode  all: every tracked file · paths: every line of `paths` · staged: lines added in the
 *         index · head: lines changed in the working tree · base: lines added since `base`
 *
 * Returns `{ kept, blocking }`: findings `{ file, line, level, rule, message }`, where kept ones also
 * carry the `reason` from their `// style-check keep: <reason>` marker.
 */
export function check({ repo, mode, base, paths = [], config }) {
  const git = (...gitArgs) =>
    execFileSync('git', ['-C', repo, ...gitArgs], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });

  // Which lines of which files to check: every line (null) or only the lines a diff adds.
  const scope = new Map();
  if (mode === 'all' || mode === 'paths') {
    for (const file of git(
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      ...paths,
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
  if (scope.size === 0) return { kept: [], blocking: [] };

  // TypeScript comes from the checked project (a peer dependency), so the check parses with the
  // project's own version. The rules need the classic compiler API (symbols and a checker), which
  // TypeScript 7's package doesn't expose; `@typescript/typescript6` is the fallback that does.
  let ts;
  for (const name of ['typescript', '@typescript/typescript6']) {
    try {
      ts = createRequire(join(repo, 'package.json'))(name);
    } catch {
      continue;
    }
    if (ts.createProgram) break;
    ts = undefined;
  }
  if (!ts)
    throw new Error(
      `No TypeScript with the compiler API in ${repo}: install typescript 5 or 6, or @typescript/typescript6 next to TypeScript 7.`,
    );

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
  // style-check keep: read once per file in the loop below; inlined, every file would refilter.
  const enabled = rules.filter(
    (rule) => presets[config.preset].includes(rule.id) && config.rules[rule.id] !== 'off',
  );

  const findings = [];
  for (const [file, lines] of scope) {
    const source = program.getSourceFile(join(repo, file));
    const lineOf = (node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    // Real comments only (from the parser): a string or regex that spells a directive doesn't
    // count.
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
    // style-check keep: inlined into the callback below, every rule would rebuild the comment list.
    const context = {
      ts,
      checker: program.getTypeChecker(),
      source,
      file,
      repo,
      lines,
      lineOf,
      text: source.getFullText().split('\n'),
      inScope: (node) => lines === null || lines.has(lineOf(node)),
      comments: [...comments.values()]
        .map((range) => ({
          comment: source.getFullText().slice(range.pos, range.end),
          line: source.getLineAndCharacterOfPosition(range.pos).line + 1,
        }))
        .filter(({ line }) => lines === null || lines.has(line)),
      isAppCode: config.appCode.some((glob) => matchesGlob(file, glob)),
      isComponent:
        config.components.some((glob) => matchesGlob(file, glob)) &&
        !/\.(stories|test|examples)\.tsx$/.test(file),
    };
    const runs = enabled.map((rule) =>
      rule.check({
        ...context,
        report: ({ node, line = lineOf(node), level, message, isKeepable = true }) =>
          findings.push({
            file,
            line,
            level: config.rules[rule.id] ?? level,
            rule: rule.guide,
            message,
            isKeepable,
          }),
      }),
    );
    const visit = (node) => {
      for (const run of runs) run.visit?.(node);
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const run of runs) run.finish?.();
  }

  // A `// style-check keep: <reason>` line right above a finding moves it to the kept list, unless
  // its rule says the guide never excuses it. The marker is read from the content that was checked
  // (the index for --staged), so an unstaged marker can't keep a staged finding.
  const { kept = [], blocking = [] } = Object.groupBy(
    findings.map(({ isKeepable, ...finding }) => ({
      ...finding,
      reason: isKeepable
        ? contents
            .get(join(repo, finding.file))
            .split('\n')
            [finding.line - 2]?.match(/^\s*\/\/\s*style-check keep:\s*(\S.*)$/)?.[1]
        : undefined,
    })),
    (finding) => (finding.reason ? 'kept' : 'blocking'),
  );
  return { kept, blocking };
}

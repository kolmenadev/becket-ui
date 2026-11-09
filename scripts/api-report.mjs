#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reportFiles = [
  ['react.api.md', '@becket-ui/react'],
  ['tokens-preset.api.md', '@becket-ui/tokens'],
  ['tokens-theme.api.md', '@becket-ui/tokens'],
  ['tokens-recipes.api.json', '@becket-ui/tokens'],
  ['tokens-css-vars.api.txt', '@becket-ui/tokens'],
];

// loadFileAndPrepare walks up from api/config and would title every report "becket-ui".
function extractorReport({ configPath, manifestPath, fileName }) {
  const loaded = ExtractorConfig.loadFile(resolve(root, configPath));
  // A fresh folder so --check can read the generated report without rewriting api/.
  const folder = mkdtempSync(join(tmpdir(), 'becket-api-'));
  const actualFolder = join(folder, 'actual');
  const expectedFolder = join(folder, 'expected');
  mkdirSync(actualFolder);
  mkdirSync(expectedFolder);
  loaded.apiReport.reportTempFolder = actualFolder;
  loaded.apiReport.reportFolder = expectedFolder;
  const committed = join(root, 'api', fileName);
  if (existsSync(committed)) copyFileSync(committed, join(expectedFolder, fileName));
  try {
    if (
      !Extractor.invoke(
        ExtractorConfig.prepare({
          configObject: loaded,
          configObjectFullPath: resolve(root, configPath),
          packageJsonFullPath: resolve(root, manifestPath),
        }),
        { localBuild: true, showVerboseMessages: false },
      ).succeeded
    ) {
      throw new Error(`API Extractor failed for ${fileName}`);
    }
    const text = readFileSync(join(actualFolder, fileName), 'utf8');
    return text.endsWith('\n') ? text : `${text}\n`;
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

const classifyAt = process.argv.indexOf('--classify');
const classifyDir = classifyAt === -1 ? undefined : resolve(process.argv[classifyAt + 1] ?? '');
const isCheck = process.argv.includes('--check');
const isUpdate = process.argv.includes('--update');
if (isCheck === isUpdate) {
  console.error('Pass --check or --update.');
  process.exit(1);
}
if (classifyAt !== -1 && !process.argv[classifyAt + 1]) {
  console.error('--classify needs a directory.');
  process.exit(1);
}
if (classifyDir && !isCheck) {
  console.error('--classify is only valid with --check.');
  process.exit(1);
}

const generated = {};
if (!classifyDir) {
  generated['react.api.md'] = extractorReport({
    configPath: 'api/config/react.json',
    manifestPath: 'packages/react/package.json',
    fileName: 'react.api.md',
  });
  generated['tokens-preset.api.md'] = extractorReport({
    configPath: 'api/config/tokens-preset.json',
    manifestPath: 'packages/tokens/package.json',
    fileName: 'tokens-preset.api.md',
  });
  generated['tokens-theme.api.md'] = extractorReport({
    configPath: 'api/config/tokens-theme.json',
    manifestPath: 'packages/tokens/package.json',
    fileName: 'tokens-theme.api.md',
  });

  const extend = (await import(pathToFileURL(join(root, 'packages/tokens/dist/preset.js')).href))
    .becketPreset.theme.extend;
  const recipes = { ...extend.recipes, ...extend.slotRecipes };
  const summary = {};
  for (const recipeName of Object.keys(recipes).toSorted()) {
    const recipe = recipes[recipeName];
    const variants = recipe.variants ?? {};
    const body = {};
    for (const variantName of Object.keys(variants).toSorted()) {
      body[variantName] = Object.keys(variants[variantName]).toSorted();
    }
    const defaults = recipe.defaultVariants ?? {};
    body.defaultVariants = Object.fromEntries(
      Object.keys(defaults)
        .toSorted()
        .map((key) => [key, defaults[key]]),
    );
    summary[recipeName] = Object.fromEntries(
      Object.keys(body)
        .toSorted()
        .map((key) => [key, body[key]]),
    );
  }
  generated['tokens-recipes.api.json'] = `${JSON.stringify(summary, null, 2)}\n`;

  generated['tokens-css-vars.api.txt'] = `${[
    ...new Set(
      [
        ...readFileSync(join(root, 'packages/tokens/index.css'), 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .matchAll(/(?<![\w-])(--(?:beckui|becket)-[A-Za-z0-9-]+)(?=\s*:)/g),
      ].map((match) => match[1]),
    ),
  ]
    .toSorted()
    .join('\n')}\n`;
}

if (isUpdate) {
  mkdirSync(join(root, 'api'), { recursive: true });
  for (const [fileName, text] of Object.entries(generated)) {
    writeFileSync(join(root, 'api', fileName), text);
    console.log(`Wrote api/${fileName}`);
  }
  process.exit(0);
}

const packageRoot = classifyDir ?? root;
let baseCommit = '';
if (!classifyDir) {
  // Same base ref CI's style check uses. A push to main falls back to main, then fails closed.
  const merged = spawnSync(
    'git',
    [
      'merge-base',
      'HEAD',
      process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  baseCommit = merged.status === 0 ? merged.stdout.trim() : '';
  if (!baseCommit) {
    const fallback = spawnSync('git', ['merge-base', 'HEAD', 'main'], {
      cwd: root,
      encoding: 'utf8',
    });
    baseCommit = fallback.stdout.trim();
    if (!baseCommit) {
      console.error(
        (fallback.stderr || merged.stderr || 'Could not resolve the base commit.').trim(),
      );
      process.exit(1);
    }
  }
}

const pairs = [];
if (!classifyDir) {
  for (const [fileName, packageName] of reportFiles) {
    const committedPath = join(root, 'api', fileName);
    pairs.push({
      kind: 'stale',
      fileName,
      packageName,
      before: existsSync(committedPath) ? readFileSync(committedPath, 'utf8') : '',
      after: generated[fileName] ?? '',
    });
  }
}
for (const [fileName, packageName] of reportFiles) {
  let before = '';
  if (classifyDir) {
    const basePath = join(classifyDir, 'base', fileName);
    if (existsSync(basePath)) before = readFileSync(basePath, 'utf8');
  } else {
    const shown = spawnSync('git', ['show', `${baseCommit}:api/${fileName}`], {
      cwd: root,
      encoding: 'utf8',
    });
    if (shown.status === 0) before = shown.stdout;
  }
  const headPath = join(classifyDir ? join(classifyDir, 'head') : join(root, 'api'), fileName);
  pairs.push({
    kind: 'review',
    fileName,
    packageName,
    before,
    after: existsSync(headPath) ? readFileSync(headPath, 'utf8') : '',
  });
}

const staleTexts = [];
const removed = new Set();
const removedDiffs = [];
for (const pair of pairs) {
  let text = '';
  if (pair.before !== pair.after) {
    const folder = mkdtempSync(join(tmpdir(), 'becket-diff-'));
    writeFileSync(join(folder, 'before'), pair.before);
    writeFileSync(join(folder, 'after'), pair.after);
    // The acknowledgement rule is defined on unified-diff lines, and Node has no unified diff.
    const diff = spawnSync(
      'git',
      ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--no-color', '--', 'before', 'after'],
      { cwd: folder, encoding: 'utf8' },
    );
    rmSync(folder, { recursive: true, force: true });
    if (diff.status !== 0 && diff.status !== 1) {
      throw new Error(diff.stderr || `git diff failed for ${pair.fileName}`);
    }
    text = (diff.stdout ?? '')
      .replaceAll(
        'diff --git a/before b/after',
        `diff --git a/api/${pair.fileName} b/api/${pair.fileName}`,
      )
      .replaceAll('--- a/before', `--- a/api/${pair.fileName}`)
      .replaceAll('+++ b/after', `+++ b/api/${pair.fileName}`);
  }
  if (pair.kind === 'stale' && text) staleTexts.push(text);
  // A removed `--beckui-*` line gains one more `-`, so it starts with `---` and no space.
  // The file header is `--- a/api/...`.
  if (
    pair.kind === 'review' &&
    text.split('\n').some((line) => line.startsWith('-') && !line.startsWith('--- '))
  ) {
    removed.add(pair.packageName);
    removedDiffs.push(text);
  }
}

if (staleTexts.length) {
  console.log(staleTexts.join(''));
  process.exit(1);
}

if (removed.size) {
  const versions = {
    '@becket-ui/react': JSON.parse(
      readFileSync(join(packageRoot, 'packages/react/package.json'), 'utf8'),
    ).version,
    '@becket-ui/tokens': JSON.parse(
      readFileSync(join(packageRoot, 'packages/tokens/package.json'), 'utf8'),
    ).version,
  };
  const bumps = new Map();
  if (existsSync(join(packageRoot, '.changeset'))) {
    for (const entry of readdirSync(join(packageRoot, '.changeset'))) {
      if (!entry.endsWith('.md') || entry === 'README.md') continue;
      const front = readFileSync(join(packageRoot, '.changeset', entry), 'utf8').match(
        /^---\r?\n([\s\S]*?)\r?\n---/,
      );
      if (!front) continue;
      for (const line of front[1].split('\n')) {
        const found = line.match(
          /^["']?(@becket-ui\/(?:react|tokens))["']?\s*:\s*(patch|minor|major)\s*$/,
        );
        if (!found) continue;
        const recorded = bumps.get(found[1]) ?? new Set();
        recorded.add(found[2]);
        bumps.set(found[1], recorded);
      }
    }
  }
  const missing = [...removed].filter((packageName) => {
    if (!versions[packageName]) throw new Error(`No version for ${packageName}`);
    return ![...(bumps.get(packageName) ?? [])].some((bump) =>
      Number(versions[packageName].split('.')[0]) < 1
        ? bump === 'minor' || bump === 'major'
        : bump === 'major',
    );
  });
  if (missing.length) {
    console.log(removedDiffs.join(''));
    for (const packageName of missing.toSorted()) {
      console.error(`removed API without a minor/major changeset for ${packageName}`);
    }
    process.exit(1);
  }
}

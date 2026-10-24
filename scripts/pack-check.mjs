#!/usr/bin/env node
/**
 * Fail if packed tarballs are missing the files consumers need.
 * pnpm pack has no --dry-run; pack to a temp dir and delete after.
 */
import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = mkdtempSync(join(tmpdir(), 'becket-pack-'));

function packedFiles(filter) {
  const raw = execSync(`pnpm --filter ${filter} pack --json --pack-destination ${dest}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const marker = raw.lastIndexOf('"files"');
  const start = marker >= 0 ? raw.lastIndexOf('{', marker) : raw.lastIndexOf('{');
  if (start < 0) {
    throw new Error(`No JSON in pack output for ${filter}:\n${raw.slice(0, 400)}`);
  }
  const json = JSON.parse(raw.slice(start));
  const files = json.files ?? [];
  return files.map((f) => (typeof f === 'string' ? f : f.path));
}

function assertIncludes(files, needles, label) {
  const missing = needles.filter((n) => !files.some((f) => String(f).includes(n)));
  if (missing.length) {
    console.error(`${label} pack is missing:\n  ${missing.join('\n  ')}`);
    console.error('Files seen:\n  ' + files.slice(0, 50).join('\n  '));
    process.exit(1);
  }
}

function assertNone(files, needles, label) {
  const found = needles.filter((n) => files.some((f) => String(f).includes(n)));
  if (found.length) {
    console.error(`${label} pack should not include:\n  ${found.join('\n  ')}`);
    process.exit(1);
  }
}

/**
 * Install the packed tarballs into a throwaway consumer, then:
 * - import the library with plain Node ESM, the way scripts, `node --test` and
 *   bundler-free SSR do (MAV-120). Bundlers forgive extensionless imports; Node doesn't.
 * - typecheck a consumer against the shipped declarations with nodenext and bundler resolution.
 * - start the MCP server from its tarball and list its tools over stdio, the way
 *   `npx @becket-ui/mcp` runs it.
 */
function assertConsumer() {
  const consumer = mkdtempSync(join(tmpdir(), 'becket-import-'));
  try {
    const modules = join(consumer, 'node_modules');
    mkdirSync(join(modules, '@becket-ui'), { recursive: true });
    for (const tarball of readdirSync(dest).filter((name) => name.endsWith('.tgz'))) {
      const unpacked = mkdtempSync(join(tmpdir(), 'becket-tgz-'));
      execSync(`tar -xzf ${JSON.stringify(join(dest, tarball))} -C ${JSON.stringify(unpacked)}`);
      const { name } = JSON.parse(readFileSync(join(unpacked, 'package', 'package.json'), 'utf8'));
      renameSync(join(unpacked, 'package'), join(modules, name));
      rmSync(unpacked, { recursive: true, force: true });
    }
    for (const peer of ['react', 'react-dom']) {
      symlinkSync(realpathSync(join(root, 'packages', 'react', 'node_modules', peer)), join(modules, peer));
    }
    // The server's runtime dependencies, read from its manifest so a new one can't be missed.
    for (const dependency of Object.keys(
      JSON.parse(readFileSync(join(root, 'packages', 'mcp', 'package.json'), 'utf8')).dependencies ?? {},
    )) {
      if (dependency.includes('/')) mkdirSync(join(modules, dependency.split('/')[0]), { recursive: true });
      symlinkSync(realpathSync(join(root, 'packages', 'mcp', 'node_modules', dependency)), join(modules, dependency));
    }
    writeFileSync(join(consumer, 'package.json'), '{"type":"module","private":true}\n');
    const probe = "const m = await import('@becket-ui/react'); if (!m.Button || !m.Container) throw new Error('missing exports'); console.log(Object.keys(m).length);";
    let exportCount;
    try {
      exportCount = execSync(`node --input-type=module -e ${JSON.stringify(probe)}`, { cwd: consumer, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (error) {
      console.error(`@becket-ui/react can't be imported with Node ESM:\n${String(error.stderr || error.message).split('\n').slice(0, 3).join('\n')}`);
      process.exit(1);
    }
    mkdirSync(join(modules, '@types'));
    for (const types of ['react', 'react-dom']) {
      symlinkSync(realpathSync(join(root, 'packages', 'react', 'node_modules', '@types', types)), join(modules, '@types', types));
    }
    writeFileSync(
      join(consumer, 'index.tsx'),
      [
        "import { Button, Container, SearchIcon } from '@becket-ui/react';",
        "import { css, type JsxStyleProps } from '@becket-ui/tokens';",
        "import { button } from '@becket-ui/tokens/recipes';",
        "import { stack } from '@becket-ui/tokens/patterns';",
        "export const page = <Container><SearchIcon /><Button className={css({ color: 'link' })}>Go</Button></Container>;",
        'export const classes = [button(), stack()];',
        'export type Style = JsxStyleProps;',
        '',
      ].join('\n'),
    );
    // Type the tarballs the way consumers do: nodenext (Node, strict ESM) and bundler (Vite, Next),
    // with skipLibCheck off so the shipped declarations are checked too (MAV-121).
    for (const resolution of ['nodenext', 'bundler']) {
      writeFileSync(
        join(consumer, `tsconfig.${resolution}.json`),
        JSON.stringify({
          compilerOptions: {
            module: resolution === 'nodenext' ? 'nodenext' : 'esnext',
            moduleResolution: resolution,
            target: 'es2022',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: false,
            noEmit: true,
          },
          files: ['index.tsx'],
        }),
      );
      const typecheck = spawnSync(join(root, 'node_modules', '.bin', 'tsc'), ['-p', `tsconfig.${resolution}.json`], { cwd: consumer, encoding: 'utf8' });
      if (typecheck.status !== 0) {
        console.error(`The packed declarations don't typecheck with moduleResolution "${resolution}":\n${(typecheck.stdout || typecheck.stderr || typecheck.error?.message || '').split('\n').slice(0, 10).join('\n')}`);
        process.exit(1);
      }
    }
    // The preset entry, as an app on Panda 2 uses it. 0.6.0 shipped a preset.d.ts naming types it
    // never imported, and the check above never imported it (MAV-156). Panda's own declarations
    // and their dependencies don't pass skipLibCheck: false, so an error in a file counts only when
    // the file is Becket's or this probe; an error that names no file (a config error) always counts.
    symlinkSync(
      realpathSync(join(root, 'packages', 'tokens', 'node_modules', '@pandacss')),
      join(modules, '@pandacss'),
    );
    writeFileSync(
      join(consumer, 'preset.ts'),
      [
        "import { defineConfig, type Preset } from '@pandacss/dev';",
        "import { becketPreset, BECKET_PREFIX } from '@becket-ui/tokens/preset';",
        'export const preset: Preset = becketPreset;',
        "export default defineConfig({ presets: ['@pandacss/preset-base', becketPreset], prefix: BECKET_PREFIX });",
        '',
      ].join('\n'),
    );
    for (const resolution of ['nodenext', 'bundler']) {
      writeFileSync(
        join(consumer, `tsconfig.preset.${resolution}.json`),
        JSON.stringify({
          compilerOptions: {
            module: resolution === 'nodenext' ? 'nodenext' : 'esnext',
            moduleResolution: resolution,
            target: 'es2022',
            strict: true,
            skipLibCheck: false,
            noEmit: true,
          },
          files: ['preset.ts'],
        }),
      );
      const typecheck = spawnSync(
        join(root, 'node_modules', '.bin', 'tsc'),
        ['-p', `tsconfig.preset.${resolution}.json`, '--pretty', 'false'],
        { cwd: consumer, encoding: 'utf8' },
      );
      const errors = `${typecheck.stdout}${typecheck.stderr}`
        .split('\n')
        .filter(
          (line) =>
            /error TS\d+/.test(line) &&
            (!/^\S+\(\d+,\d+\): error/.test(line) ||
              /^(preset\.ts|node_modules\/@becket-ui\/)/.test(line)),
        );
      if (errors.length > 0 || typecheck.error) {
        console.error(
          `@becket-ui/tokens/preset doesn't typecheck with moduleResolution "${resolution}":\n${(errors.join('\n') || typecheck.error?.message).split('\n').slice(0, 10).join('\n')}`,
        );
        process.exit(1);
      }
    }
    const requests = [
      { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'pack-check', version: '0' } } },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    ];
    const server = spawnSync('node', [join(modules, '@becket-ui', 'mcp', 'dist', 'server.js')], {
      cwd: consumer,
      input: requests.map((request) => JSON.stringify(request)).join('\n') + '\n',
      encoding: 'utf8',
      timeout: 10_000,
    });
    const tools = server.stdout
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((message) => message.id === 2)?.result?.tools;
    if (!tools?.length) {
      console.error(`@becket-ui/mcp didn't answer tools/list from its tarball:\n${(server.stderr || server.error?.message || '').slice(0, 400)}`);
      process.exit(1);
    }
    return { exportCount, toolCount: tools.length };
  } finally {
    rmSync(consumer, { recursive: true, force: true });
  }
}

try {
  const tokens = packedFiles('@becket-ui/tokens');
  assertIncludes(
    tokens,
    [
      'styled-system/recipes',
      'styled-system/css',
      'index.css',
      'dist/preset',
      'theme/index.mjs',
      'theme/index.d.ts',
      'theme/color.mjs',
      'theme/contrast.mjs',
      'theme/derive.mjs',
      'theme.example.css',
    ],
    '@becket-ui/tokens',
  );
  assertNone(tokens, ['theme/index.test.mjs', 'theme/contrast.test.mjs', 'theme/derive.test.mjs'], '@becket-ui/tokens');

  const react = packedFiles('@becket-ui/react');
  assertIncludes(react, ['dist/index.js', 'dist/index.d.ts', 'guides/building-with-becket.md'], '@becket-ui/react');
  assertNone(react, ['.test.', '.stories.', '.examples.', 'compositions', 'src/components'], '@becket-ui/react');

  const mcp = packedFiles('@becket-ui/mcp');
  assertIncludes(mcp, ['dist/server.js', 'dist/data/catalog.json', 'dist/data/theme.json', 'dist/data/guidelines.md'], '@becket-ui/mcp');
  assertNone(mcp, ['src/', 'test/', 'scripts/'], '@becket-ui/mcp');

  const { exportCount, toolCount } = assertConsumer();

  console.log('pack-check ok');
  console.log(`  tokens: ${tokens.length} files`);
  console.log(`  react:  ${react.length} files`);
  console.log(`  mcp:    ${mcp.length} files`);
  console.log(`  node import: ok (${exportCount} exports)`);
  console.log('  types: ok (nodenext, bundler), preset entry included');
  console.log(`  mcp server: ok (${toolCount} tools)`);
} finally {
  rmSync(dest, { recursive: true, force: true });
}

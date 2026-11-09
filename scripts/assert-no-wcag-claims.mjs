import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const grep = spawnSync(
  'grep',
  [
    '-rniE',
    'pass(es)? (WCAG|AA)|pass WCAG',
    '--include=*.md',
    '--include=*.ts',
    '--include=*.mjs',
    '--exclude=CHANGELOG.md',
    '--exclude-dir=node_modules',
    '--exclude-dir=dist',
    'README.md',
    'docs',
    'packages',
  ],
  {
    cwd: join(dirname(fileURLToPath(import.meta.url)), '..'),
    encoding: 'utf8',
  },
);

if (grep.status === 1) process.exit(0);
process.stdout.write(grep.stdout ?? '');
process.stderr.write(grep.stderr ?? '');
process.exit(grep.status === 0 ? 1 : (grep.status ?? 1));

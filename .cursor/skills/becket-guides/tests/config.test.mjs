// becket.config.json picks the preset, paths and rule levels (MAV-171). A project without one is any
// React or TypeScript codebase: it gets the coding-style preset and none of Becket's rules.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { check, git, makeRepo, removeRepo } from './harness.mjs';

const repos = [];
after(() => repos.forEach(removeRepo));
// Named for its many uses: every test starts from a fresh repo and cleans it up afterwards.
const repoWith = (files) => {
  const repo = makeRepo(files);
  repos.push(repo);
  return repo;
};

// A `get` prefix (coding-style), plus a raw element and a literal color (becket), in a file that
// Becket's config calls app code.
const page = `export function getPage() {
  return <div style={{ color: '#fff' }}>Hi</div>;
}
`;

describe('config', () => {
  it('runs coding-style, with no Becket paths, in a project without a config', () => {
    const repo = repoWith({ 'apps/next-example/page.tsx': page });
    git(repo, 'rm', '-q', 'becket.config.json');
    git(repo, 'commit', '-qm', 'no config');
    const { status, findings } = check({ repo });
    assert.equal(status, 1);
    assert.deepEqual(findings, [
      'apps/next-example/page.tsx:1  [must] getPage: drop the get prefix and name what it does (select, find, format, to…)  — CODING-STYLE § Avoid implied keywords in function names',
    ]);
  });

  it('applies the becket preset to the app code paths it names', () => {
    const { findings } = check({
      repo: repoWith({
        'becket.config.json': '{ "preset": "becket", "appCode": ["app/**"] }',
        'app/page.tsx': page,
      }),
    });
    assert.deepEqual(
      findings.map((line) => line.split('  — ')[1]),
      [
        'CODING-STYLE § Avoid implied keywords in function names',
        'building-with-becket § 2 Must use a Becket component when one exists',
        'building-with-becket § 2 Known gaps / § 11',
        'building-with-becket § 3 / becket.mdc § Styling',
      ],
    );
  });

  it('turns a rule off and changes another rule’s level', () => {
    const { status, findings } = check({
      repo: repoWith({
        'becket.config.json':
          '{ "rules": { "no-get-prefix": "off", "object-parameters": "review" } }',
        'src/a.ts': `${page.replace(/<div.*>/, '1;')}export const sum = (a: number, b: number, c: number) => a + b + c;\n`,
      }),
    });
    assert.equal(status, 1);
    assert.deepEqual(findings, [
      'src/a.ts:4  [review] 3 positional parameters; pass one object  — CODING-STYLE § Prefer object parameters when there are more than 2',
    ]);
  });

  it('fails loudly on an unknown preset or rule', () => {
    for (const config of ['{ "preset": "becket-app" }', '{ "rules": { "no-gets": "off" } }']) {
      const { status, output } = check({
        repo: repoWith({ 'becket.config.json': config, 'src/a.ts': 'export const a = 1;\n' }),
      });
      assert.equal(status, 1);
      assert.match(output, /becket\.config\.json: unknown (preset "becket-app"|rule "no-gets")/);
    }
  });
});

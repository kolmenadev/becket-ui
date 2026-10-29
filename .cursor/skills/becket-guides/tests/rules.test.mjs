// Every rule, today (MAV-170): its invalid fixture reports exactly the expected lines, each linked
// to the rule's guide section, and its valid fixture reports nothing.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { check, makeRepo, removeRepo } from './harness.mjs';
import { rules } from './rules.fixtures.mjs';

const repos = [];
after(() => repos.forEach(removeRepo));

for (const { rule, invalid, expect, valid } of rules) {
  describe(rule, () => {
    it('reports the invalid fixture', () => {
      const repo = makeRepo(invalid);
      repos.push(repo);
      const { status, findings } = check({ repo });
      assert.equal(status, 1);
      assert.deepEqual(
        findings.map((line) => line.replace(/ {2}— .*$/, '')).toSorted(),
        expect.toSorted(),
      );
      for (const line of findings) assert.ok(line.endsWith(`  — ${rule}`), line);
    });

    it('passes the valid fixture', () => {
      const repo = makeRepo(valid);
      repos.push(repo);
      const { status, findings } = check({ repo });
      assert.deepEqual(findings, []);
      assert.equal(status, 0);
    });
  });
}

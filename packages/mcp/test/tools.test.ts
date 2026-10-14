import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

import { loadData, type Data } from '../src/data';
import { formatReview, reviewUsage } from '../src/review';
import { componentExample, componentProps, findComponent, guidelines, installation, listComponents, theme } from '../src/tools';

const dataDir = join(__dirname, '..', 'dist', 'data');
let data: Data;

beforeAll(() => {
  if (!existsSync(dataDir)) throw new Error('Run `pnpm -F @becket-ui/mcp build` first (generates dist/data).');
  data = loadData(dataDir);
});

describe('catalog', () => {
  it('covers every public component export in @becket-ui/react', () => {
    const index = readFileSync(join(__dirname, '..', '..', 'react', 'src', 'index.ts'), 'utf8');
    const exported = [...index.matchAll(/export\s+\{([^}]*)\}\s+from\s+'\.\/components\//g)]
      .flatMap(([, names]) => names.split(','))
      .map((name) => name.trim())
      .filter((name) => /^[A-Z]/.test(name));
    const catalogued = new Set(data.catalog.components.flatMap((component) => component.exports));
    expect(exported.filter((name) => !catalogued.has(name))).toEqual([]);
  });

  it('finds components by part and family names', () => {
    expect(findComponent(data, 'CardHeader')?.name).toBe('Card');
    expect(findComponent(data, 'Thead')?.name).toBe('Table');
    expect(findComponent(data, 'searchicon')?.name).toBe('Glyphs');
  });
});

describe('tools', () => {
  it('installation names the CSS import and the theme on <html>', () => {
    const text = installation(data);
    expect(text).toContain("import '@becket-ui/tokens/index.css'");
    expect(text).toContain('data-theme');
  });

  it('list_components groups components and flags client ones', () => {
    const text = listComponents(data);
    expect(text).toContain('## Layout');
    expect(text).toMatch(/- Dialog \(also: [^)]*DialogHeader[^)]*\) \[client/);
  });

  it('get_component_props returns declarations and exact variant values', () => {
    const text = componentProps(data, 'Button');
    expect(text).toContain('export type ButtonProps');
    expect(text).toContain('- visual: "primary" | "secondary" | "neutral" | "outline"');
  });

  it('get_component_example returns one story or all of them', () => {
    expect(componentExample(data, 'Dialog', 'Open')).toContain('useState(true)');
    expect(componentExample(data, 'Dialog')).toContain('## Alert');
    expect(componentExample(data, 'Dialog', 'Nope')).toContain('Available: Default, Alert, Open');
  });

  it('get_theme returns dark and light values', () => {
    const text = theme(data, 'colors');
    expect(text).toMatch(/\| background \| `var\(--beckui--colors-background\)` \| oklch\([^|]+\| oklch\(/);
    expect(theme(data, 'nope' as never)).toContain('Unknown token group');
  });

  it('get_guidelines filters by section', () => {
    expect(guidelines(data, 'checklist')).toContain('Before you finish');
    expect(guidelines(data, 'zzz')).toContain('Sections:');
  });

  it('unknown names list what exists', () => {
    expect(componentProps(data, 'Carousel')).toContain('No Becket component named "Carousel"');
  });
});

describe('review_usage', () => {
  // Trimmed from a real Claude Design → Claude Code handoff (2026-10-13).
  const handoff = `import { Badge, Switch, Spacer } from '@becket-ui/react';
<div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
  <h1 style={{ margin: 0, fontSize: 'var(--beckui--font-sizes-2xl)' }}>Workspace settings</h1>
  <span style={{ color: '#8a8a8a', fontWeight: 600 }}>Muted</span>
  <div style={{ height: 1, background: 'var(--beckui--colors-border)' }} />
  <button onClick={save}>Save</button>
</div>`;

  it('flags each raw pattern with its Becket fix', () => {
    const rules = reviewUsage(handoff, data).map((finding) => finding.rule);
    expect(rules).toEqual(
      expect.arrayContaining([
        'unknown-export',
        'no-raw-flex-or-grid',
        'no-pixel-spacing',
        'no-raw-heading',
        'no-raw-text',
        'no-color-literals',
        'no-raw-divider',
        'no-raw-controls',
      ]),
    );
  });

  it('passes Becket code and honors TODO-acknowledged gaps', () => {
    const clean = `import { Container, Heading, Separator, Text, VStack } from '@becket-ui/react';
<Container as="main" size="md">
  <VStack gap="xl">
    <Heading as="h1" size="2xl">Workspace settings</Heading>
    <Text fontSize="sm" color="muted">Manage the workspace.</Text>
    <Separator />
    <div style={{ display: 'grid' }} /> {/* TODO (MAV-90): Grid */}
  </VStack>
</Container>`;
    expect(reviewUsage(clean, data)).toEqual([]);
    expect(formatReview([])).toContain('No issues found');
  });
});

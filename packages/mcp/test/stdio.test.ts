import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { brandManualPDF } from './brandFixtures';

// End to end: spawn the built server the way Claude Code / Cursor / VS Code do.
const serverPath = join(__dirname, '..', 'dist', 'server.js');
let client: Client;

beforeAll(async () => {
  client = new Client({ name: 'becket-mcp-test', version: '0.0.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [serverPath] }));
});

afterAll(async () => {
  await client.close();
});

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as { type: string; text: string }[]).map((part) => part.text).join('\n');

describe('stdio server', () => {
  it('lists the tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_component_example',
      'get_component_props',
      'get_guidelines',
      'get_theme',
      'installation',
      'list_components',
      'review_usage',
      'set_theme',
      'suggest_theme',
    ]);
  });

  it('sets a theme over the wire', async () => {
    const text = textOf(
      await client.callTool({ name: 'set_theme', arguments: { fonts: { sans: 'Inter' } } }),
    );
    expect(text).toContain(
      'All 34 required pairs reach their threshold in dark and light. Advisory pairs are not yet verified: neutral.900 / tertiary in dark, neutral.900 / tertiary in light, primary / background in light, primary / surface in light.',
    );
    expect(text).toContain('--beckui--fonts-sans: Inter, system-ui');
  });

  it('answers get_component_props for Button and Field', async () => {
    expect(textOf(await client.callTool({ name: 'get_component_props', arguments: { name: 'Button' } }))).toContain(
      'export type ButtonProps',
    );
    expect(textOf(await client.callTool({ name: 'get_component_props', arguments: { name: 'FieldLabel' } }))).toContain('# Field');
  });

  it('suggests a theme from a brand manual over the wire', async () => {
    expect(
      textOf(await client.callTool({ name: 'suggest_theme', arguments: { base64: brandManualPDF().toString('base64') } })),
    ).toContain('Your manual uses Open Sans');
  });

  it('reviews code over the wire', async () => {
    const result = await client.callTool({ name: 'review_usage', arguments: { code: "<h1 style={{ color: '#fff' }}>Hi</h1>" } });
    expect(textOf(result)).toContain('[no-raw-heading]');
  });
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { loadData, type Data } from './data';
import { formatReview, reviewUsage } from './review';
import { componentExample, componentProps, guidelines, installation, listComponents, theme } from './tools';

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });

export function createServer(data: Data = loadData()): McpServer {
  const server = new McpServer({ name: 'becket-ui', version: data.catalog.version });
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool(
    'installation',
    {
      title: 'Install Becket UI',
      description: 'How to install and set up Becket UI in a React app: packages, the one CSS import, and the theme on <html>.',
      annotations: readOnly,
    },
    async () => text(installation(data)),
  );

  server.registerTool(
    'list_components',
    {
      title: 'List Becket components',
      description: 'Every public Becket UI component by group, with its parts and whether it needs client JS.',
      annotations: readOnly,
    },
    async () => text(listComponents(data)),
  );

  server.registerTool(
    'get_component_props',
    {
      title: 'Get component props',
      description: 'Exact props of a Becket component (TypeScript declarations) and its recipe variant values. Accepts a component or part name, e.g. Button, CardHeader, SearchIcon.',
      inputSchema: { name: z.string().describe('Component or part name, e.g. "Card" or "CardHeader"') },
      annotations: readOnly,
    },
    async ({ name }) => text(componentProps(data, name)),
  );

  server.registerTool(
    'get_component_example',
    {
      title: 'Get component examples',
      description: 'Usage examples for a Becket component (its Storybook stories). Optionally pick one story by name.',
      inputSchema: {
        name: z.string().describe('Component name, e.g. "Dialog"'),
        story: z.string().optional().describe('Story name, e.g. "Open"'),
      },
      annotations: readOnly,
    },
    async ({ name, story }) => text(componentExample(data, name, story)),
  );

  server.registerTool(
    'get_theme',
    {
      title: 'Get theme tokens',
      description: 'Becket design tokens with dark and light values: colors, spacing, radii, sizes, font-sizes, shadows.',
      inputSchema: {
        group: z.enum(['colors', 'spacing', 'radii', 'sizes', 'font-sizes', 'shadows']).optional().describe('One token group; omit for all'),
      },
      annotations: readOnly,
    },
    async ({ group }) => text(theme(data, group)),
  );

  server.registerTool(
    'get_guidelines',
    {
      title: 'Get the Becket app-code guide',
      description: 'Rules for writing app code with Becket: which component replaces each raw element, props-then-tokens styling, abstraction, state, accessibility. Read before writing UI.',
      inputSchema: {
        topic: z.string().optional().describe('Section filter, e.g. "component", "tokens", "accessibility", "example", "checklist"'),
      },
      annotations: readOnly,
    },
    async ({ topic }) => text(guidelines(data, topic)),
  );

  server.registerTool(
    'review_usage',
    {
      title: 'Review Becket usage',
      description: 'Check React code against the Becket app-code guide: raw layout/text/controls, literal colors, pixel spacing, recipe classes, Chakra imports, unknown exports. Run before finishing.',
      inputSchema: { code: z.string().describe('The TSX/JSX source to review') },
      annotations: readOnly,
    },
    async ({ code }) => text(formatReview(reviewUsage(code, data))),
  );

  return server;
}

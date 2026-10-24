import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { loadData, type Data } from './data';
import { formatReview, reviewUsage } from './review';
import { setTheme } from './theme/setTheme';
import { suggestTheme } from './theme/suggestTheme';
import { componentExample, componentProps, guidelines, installation, listComponents, theme } from './tools';

// as const: the MCP SDK types a text block's `type` as the literal 'text'.
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

  const tokens = z.record(z.string(), z.string());
  server.registerTool(
    'set_theme',
    {
      title: 'Set a brand theme',
      description:
        'Turn brand tokens into Becket theme CSS that passes WCAG 2.2 AA in dark and light. Give one to three brand colors (Becket derives every color token) and/or exact tokens. Returns the CSS to write, the same theme as defineBecketTheme() code, why each value was chosen, and a contrast report. Writes nothing; you write the file. For a logo, image URL or brand manual, call suggest_theme first.',
      inputSchema: {
        brand: z.array(z.string()).min(1).max(3).optional().describe('Brand colors, most important first: hex, rgb(), hsl() or oklch()'),
        colors: z
          .record(z.string(), z.union([z.string(), z.record(z.string(), z.string())]))
          .optional()
          .describe('Exact color tokens to keep, e.g. { "background": { "dark": "#101820", "light": "#ffffff" } }. With brand, these are pinned and the rest is derived.'),
        fonts: tokens.optional().describe('{ "sans": "Inter", "mono": "JetBrains Mono" }'),
        radii: tokens.optional().describe('none, sm, md, lg, xl, full, e.g. { "md": "0.25rem" }'),
        fontSizes: tokens.optional().describe('{ "base": "1rem" } resizes all text; xs–6xl override single steps'),
        spacing: tokens.optional().describe('{ "unit": "0.25rem" } resizes all spacing; textUnit (em) spacing inside text'),
        sizes: tokens.optional().describe('{ "field": "16rem" }'),
        density: z
          .record(z.string(), z.record(z.string(), z.object({ px: z.string().optional(), py: z.string().optional() })))
          .optional()
          .describe('Component padding, e.g. { "button": { "md": { "px": "0.75rem" } } }'),
      },
      annotations: readOnly,
    },
    async (input) => text(setTheme(input)),
  );

  server.registerTool(
    'suggest_theme',
    {
      title: 'Suggest a brand theme',
      description:
        "Read a logo (PNG, JPEG, SVG) or a brand manual (PDF) and suggest Becket brand tokens: colors, plus fonts, corner radius and text size when a manual states them. Returns what it found and a step-by-step script: ask the user one decision at a time, then call set_theme with what they confirm. Pass exactly one of path, url (public https) or base64. For an image only pasted in chat, pass the colors you see in `colors` instead.",
      inputSchema: {
        path: z.string().optional().describe('Local file path, absolute or relative to the working directory'),
        url: z.string().optional().describe('Public https URL of the image or PDF'),
        base64: z.string().optional().describe('File contents as base64 or a data: URL'),
        colors: z.array(z.string()).min(1).max(8).optional().describe('Colors you read from an image you can see but cannot pass as a file, most prominent first'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (input) => text(await suggestTheme(input)),
  );

  return server;
}

import type { Component, Data } from './data';

/**
 * Tool handlers as plain functions returning text, so they're testable without
 * a transport. server.ts wires them to MCP.
 */

export function installation(data: Data): string {
  const { version } = data.catalog;
  return `# Installing Becket UI (@becket-ui/react ${version})

pnpm add @becket-ui/react @becket-ui/tokens

1. Import the CSS once, at the app entry:
   import '@becket-ui/tokens/index.css';
2. Put the theme on <html>: <html data-theme="dark"> (dark is the default) or "light".
   Set it at the app root, never inside a screen. There is no provider and no theme wrapper.
3. Import components from '@becket-ui/react':
   import { Button, Card, Container, Stack, Text } from '@becket-ui/react';

- Panda CSS is not required: styles ship prebuilt in index.css. Don't copy .beckui--* class names.
- index.css paints the page background, text color and font from the theme.
- Components marked client in list_components use state or effects ('use client'); the rest render in React Server Components.

Before writing UI, call get_guidelines (the app-code guide). Before finishing, call review_usage on your code.`;
}

export function listComponents(data: Data): string {
  const byGroup = new Map<string, Component[]>();
  for (const component of data.catalog.components) {
    const group = component.group ?? 'Other';
    byGroup.set(group, [...(byGroup.get(group) ?? []), component]);
  }
  const sections = [...byGroup.entries()].map(([group, components]) => {
    const rows = components.map((component) => {
      const parts = component.exports.filter((name) => name !== component.name);
      const tags = [component.client ? 'client' : 'server-safe', component.examples.length ? `${component.examples.length} examples` : null]
        .filter(Boolean)
        .join(', ');
      return `- ${component.name}${parts.length ? ` (also: ${parts.join(', ')})` : ''} [${tags}]${component.summary ? ` — ${component.summary.split('\n')[0]}` : ''}`;
    });
    return `## ${group}\n${rows.join('\n')}`;
  });
  return `@becket-ui/react ${data.catalog.version}: ${data.catalog.components.length} component files.\nUse get_component_props for exact props and get_component_example for usage.\n\n${sections.join('\n\n')}`;
}

/** Find a component by its name, any of its exports (e.g. CardHeader, Thead, SearchIcon) or its file. */
export function findComponent(data: Data, name: string): Component | undefined {
  const wanted = name.trim().toLowerCase();
  return data.catalog.components.find(
    (component) =>
      component.name.toLowerCase() === wanted ||
      component.file.toLowerCase() === wanted ||
      component.exports.some((exported) => exported.toLowerCase() === wanted),
  );
}

function notFound(data: Data, name: string): string {
  const names = data.catalog.components.map((component) => component.name).join(', ');
  return `No Becket component named "${name}". Available: ${names}.`;
}

export function componentProps(data: Data, name: string): string {
  const component = findComponent(data, name);
  if (!component) return notFound(data, name);
  const variants = component.variants
    ? Object.entries(component.variants)
        .map(([prop, values]) => `- ${prop}: ${values.map((value) => `"${value}"`).join(' | ')}`)
        .join('\n')
    : null;
  return [
    `# ${component.name}${component.group ? ` (${component.group})` : ''}`,
    component.summary,
    `Exports: ${component.exports.join(', ')}${component.hooks.length ? `; hooks: ${component.hooks.join(', ')}` : ''}`,
    `Rendering: ${component.client ? "client component ('use client': state, effects or browser APIs)" : 'no client JS required; safe in React Server Components'}`,
    variants ? `## Recipe variants (exact values)\n${variants}` : null,
    `## Type declarations\n\`\`\`ts\n${component.dts}\n\`\`\``,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function componentExample(data: Data, name: string, story?: string): string {
  const component = findComponent(data, name);
  if (!component) return notFound(data, name);
  if (component.examples.length === 0) {
    return `${component.name} has no examples yet. Read get_component_props for its API.`;
  }
  const chosen = story
    ? component.examples.filter((example) => example.name.toLowerCase() === story.trim().toLowerCase())
    : component.examples;
  if (chosen.length === 0) {
    return `No example "${story}" for ${component.name}. Available: ${component.examples.map((example) => example.name).join(', ')}.`;
  }
  const note =
    'These are Storybook stories. In app code, import from "@becket-ui/react", drop `args`/`Story` typing, and follow get_guidelines.';
  return `# ${component.name} examples\n${note}\n\n${chosen.map((example) => `## ${example.name}\n\`\`\`tsx\n${example.code}\n\`\`\``).join('\n\n')}`;
}

export function theme(data: Data, group?: string): string {
  const groups = group ? Object.entries(data.theme).filter(([name]) => name === group) : Object.entries(data.theme);
  if (groups.length === 0) return `Unknown token group "${group}". Groups: ${Object.keys(data.theme).join(', ')}.`;
  const sections = groups.map(([name, tokens]) => {
    const rows = tokens.map((token) => `| ${token.token} | \`${token.cssVar}\` | ${token.value} | ${token.light ?? 'same'} |`);
    return `## ${name}\n| token | CSS variable | dark (default) | light |\n| --- | --- | --- | --- |\n${rows.join('\n')}`;
  });
  return `Becket tokens. In components, pass token names as props (gap="md", color="muted"). In your own CSS, use the CSS variables. Never hex, rgb() or px.\n\n${sections.join('\n\n')}`;
}

/** Topics are the guide's numbered sections, e.g. "layout" matches "2. Must use a Becket component…". */
export function guidelines(data: Data, topic?: string): string {
  const sections = data.guidelines.split(/\n(?=## )/);
  if (!topic) return data.guidelines;
  const wanted = topic.trim().toLowerCase();
  const matches = sections.filter((section) => section.split('\n')[0].toLowerCase().includes(wanted));
  if (matches.length > 0) return matches.join('\n\n');
  const titles = sections.slice(1).map((section) => section.split('\n')[0].replace(/^## /, ''));
  return `No section matches "${topic}". Sections:\n${titles.map((title) => `- ${title}`).join('\n')}`;
}

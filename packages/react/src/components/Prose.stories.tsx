import type { Meta, StoryObj } from '@storybook/react';
import { prose as proseRecipe } from '@becket-ui/tokens/recipes';
import { Badge } from './Badge';
import { Card, CardBody, CardHeader, CardTitle } from './Card';
import { Prose, type ProseProps } from './Prose';
import { Text } from './Text';

const meta: Meta<typeof Prose> = {
  title: 'Typography/Prose',
  component: Prose,
  args: { size: 'md' },
  argTypes: {
    size: { control: { type: 'select' }, options: proseRecipe.variantMap.size },
  },
  parameters: {
    controls: { include: ['size'] },
  },
};
export default meta;

type Story = StoryObj<ProseProps>;

/** The HTML a Markdown or MDX pipeline produces, styled by one wrapper. */
export const Article: Story = {
  render: (args) => (
    <Prose {...args} as="article">
      <h1>Designing with Becket in Claude Design</h1>
      <p>
        Becket is a <strong>native-first</strong> design system. This post walks through the <a href="#setup">setup</a>,
        the <em>agent guide</em> and the handoff to code. Press <kbd>⌘</kbd> <kbd>K</kbd> to search, and look for{' '}
        <mark>highlighted</mark> terms.
      </p>
      <h2 id="setup">Setup</h2>
      <p>
        Install both packages and import <code>@becket-ui/tokens/index.css</code> once:
      </p>
      <pre>
        <code>{`pnpm add @becket-ui/react @becket-ui/tokens

import '@becket-ui/tokens/index.css';`}</code>
      </pre>
      <ul>
        <li>No provider and no theme wrapper.</li>
        <li>
          Theme lives on <code>&lt;html data-theme&gt;</code>:
          <ul>
            <li>dark by default</li>
            <li>light on request</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Sync the design system.</li>
        <li>Prompt a screen.</li>
        <li>Hand off to Claude Code.</li>
      </ol>
      <blockquote>
        <p>Every visual decision is a prop with a token value.</p>
      </blockquote>
      <h3>Tokens at a glance</h3>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gap=&quot;md&quot;</code>
            </td>
            <td>0.75rem</td>
          </tr>
          <tr>
            <td>
              <code>gap=&quot;xl&quot;</code>
            </td>
            <td>2rem</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <dl>
        <dt>Prose</dt>
        <dd>Styles content you don&apos;t write as components.</dd>
      </dl>
    </Prose>
  ),
};

export const Sizes: Story = {
  render: () => (
    <>
      {proseRecipe.variantMap.size.map((size) => (
        <Prose key={size} size={size}>
          <h3>size=&quot;{size}&quot;</h3>
          <p>
            Headings, spacing and <code>code</code> scale with the base size.
          </p>
        </Prose>
      ))}
    </>
  ),
};

/** Becket components keep their own styles, markup inside them included, with no wrapper. */
export const WithComponents: Story = {
  render: () => (
    <Prose>
      <p>A post can embed Becket components:</p>
      <Card visual="outline">
        <CardHeader>
          <CardTitle>Release 0.2.0</CardTitle>
          <Badge visual="primary" size="sm">
            New
          </Badge>
        </CardHeader>
        <CardBody>
          <Text fontSize="sm" color="muted">
            Container, Box and Icon.
          </Text>
          <ul>
            <li>This list keeps the card's styles, not the article's.</li>
          </ul>
        </CardBody>
      </Card>
      <p>The text after it is styled by Prose again.</p>
    </Prose>
  ),
};

/** Markup that isn't Becket's opts out with `data-not-prose`. */
export const NotProse: Story = {
  render: () => (
    <Prose>
      <p>A widget from another library sits in the post:</p>
      <div data-not-prose>
        <ul>
          <li>This list is left unstyled by Prose.</li>
        </ul>
      </div>
      <ul>
        <li>This one is an article list.</li>
      </ul>
    </Prose>
  ),
};

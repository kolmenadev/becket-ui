import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Prose } from './Prose';

const markdownOutput = `
<h2 id="setup">Setup</h2>
<p>Install <code>@becket-ui/react</code> and read the <a href="/docs">docs</a>.</p>
<ul><li>No provider</li><li>One CSS import</li></ul>
<blockquote><p>Props, then tokens.</p></blockquote>
<pre><code>pnpm add @becket-ui/react</code></pre>
<table><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody><tr><td>md</td><td>0.75rem</td></tr></tbody></table>
<figure><img src="/a.png" alt="A chart" /><figcaption>Caption</figcaption></figure>
`;

describe('Prose', () => {
  it('renders an article landmark with the size variant', async () => {
    const { container } = render(<Prose as="article" size="lg" dangerouslySetInnerHTML={{ __html: markdownOutput }} />);
    const article = screen.getByRole('article');
    expect(article.className).toMatch(/beckui--prose--size_lg/);
    expect(screen.getByRole('heading', { level: 2, name: 'Setup' })).toBeTruthy();
    await assertNoAxeViolations(container);
  });

  it('defaults to md and keeps consumer classes last', () => {
    render(<Prose data-testid="p" className="post" />);
    const el = screen.getByTestId('p');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/beckui--prose--size_md/);
    expect(el.className.endsWith('post')).toBe(true);
  });
});

import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import '../../../packages/tokens/index.css';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // Only follow an explicit background pick. With none selected, :root
      // already renders dark, and hosts that reuse these decorators (the
      // Claude Design sync) keep control of data-theme.
      const selectedBackground = context.globals.backgrounds?.value;
      if (selectedBackground) {
        document.documentElement.setAttribute('data-theme', selectedBackground === 'light' ? 'light' : 'dark');
      }
      // Paint stories on Becket's own surface so hosts with their own page
      // chrome (Claude Design preview cards) don't put light text on white.
      return createElement(
        'div',
        {
          style: {
            background: 'var(--beckui--colors-background)',
            color: 'var(--beckui--colors-text)',
            padding: '0.75rem',
          },
        },
        Story(),
      );
    },
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#171923' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    controls: {
      exclude: /^(on[A-Z].*|dangerouslySetInnerHTML|suppressContentEditableWarning|suppressHydrationWarning)$/,
    },
    options: {
      storySort: {
        order: [
          'Layout',
          'Typography',
          'Buttons',
          'Forms',
          'Overlays',
          'Disclosure',
          'Feedback',
          'Data Display',
        ],
      },
    },
  },
};

export default preview;

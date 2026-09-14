import type { Preview } from '@storybook/react';
import '../../../packages/tokens/index.css';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const selectedBackground = context.globals.backgrounds?.value;
      const theme = selectedBackground === 'light' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', theme);
      return Story();
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

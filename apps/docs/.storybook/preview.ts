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
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#171923' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

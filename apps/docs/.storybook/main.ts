import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
const repoRoot = path.resolve(process.cwd(), '../..');

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [`${repoRoot}/packages/react/src/**/*.stories.@(ts|tsx)`],
  addons: ['@storybook/addon-a11y', '@chromatic-com/storybook'],
  staticDirs: [path.join(repoRoot, 'apps/docs/public')],
  managerHead: (head) => `${head}
    <meta property="og:title" content="Becket UI" />
    <meta property="og:description" content="Chakra-shaped React components whose styles are compiled CSS." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://kolmenadev.github.io/becket-ui/" />
    <meta property="og:image" content="https://kolmenadev.github.io/becket-ui/social-preview.png" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="640" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Becket UI" />
    <meta name="twitter:description" content="Chakra-shaped React components whose styles are compiled CSS." />
    <meta name="twitter:image" content="https://kolmenadev.github.io/becket-ui/social-preview.png" />
  `,
  viteFinal: async (config) => {
    config.base = process.env.STORYBOOK_BASE ?? '/';
    config.resolve = config.resolve || {};
    config.resolve.dedupe = [...(config.resolve.dedupe || []), 'react', 'react-dom'];
    const conditions = new Set([...(config.resolve.conditions || []), 'import', 'default']);
    config.resolve.conditions = [...conditions];
    const aliases = config.resolve.alias;
    const aliasList = Array.isArray(aliases)
      ? aliases
      : Object.entries(aliases || {}).map(([find, replacement]) => ({ find, replacement }));
    config.resolve.alias = [
      ...aliasList,
      {
        find: /^@becket-ui\/tokens\/theme$/,
        replacement: path.join(repoRoot, 'packages/tokens/theme/index.mjs'),
      },
    ];
    config.server = config.server || {};
    config.server.fs = { allow: [repoRoot, `${repoRoot}/packages`] };
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'react',
      'react-dom',
      'react-dom/client',
      '@becket-ui/tokens/theme',
    ];
    return config;
  },
};

export default config;

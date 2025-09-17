/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  jsxSingleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',
  endOfLine: 'lf',
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'always',
        singleQuote: false,
      },
    },
    {
      files: ['*.yml', '*.yaml', '*.json'],
      options: { tabWidth: 2 },
    },
    {
      files: ['*.ts', '*.tsx', '*.mts'],
      options: {
        parser: 'typescript',
      },
    },
    {
      files: ['*.cjs', '*.mjs'],
      options: { parser: 'babel' },
    },
  ],
};

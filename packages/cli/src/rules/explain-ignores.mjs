// Every lint or TypeScript ignore says why, and `@ts-ignore` is `@ts-expect-error`.
export default {
  id: 'explain-ignores',
  guide: 'CODING-STYLE § Must explain when ignoring a lint or TypeScript rule',
  check: ({ text, comments, report }) => ({
    finish() {
      for (const { comment, line } of comments) {
        if (
          /^(\/\/|\/\*)\s*(eslint-disable|@ts-expect-error|@ts-ignore|biome-ignore)/.test(
            comment,
          ) &&
          !/^\s*(\/\/|\*)(?!.*(eslint-disable|@ts-|biome-ignore))/.test(text[line - 2] ?? '')
        )
          report({ line, level: 'must', message: 'ignore without a comment above saying why' });
        if (/^(\/\/|\/\*)\s*@ts-ignore/.test(comment))
          report({
            line,
            level: 'prefer',
            message: '@ts-ignore; use @ts-expect-error so it fails once the error is gone',
            // The guide never excuses @ts-ignore, reason or not.
            isKeepable: false,
          });
      }
    },
  }),
};

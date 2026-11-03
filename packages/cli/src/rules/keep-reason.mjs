// A keep marker without a reason keeps nothing a reviewer can judge.
export default {
  id: 'keep-reason',
  guide: 'becket-guides § Kept on purpose',
  check: ({ comments, report }) => ({
    finish() {
      for (const { comment, line } of comments)
        if (
          /^\/\/\s*style-check keep\b/.test(comment) &&
          !/^\/\/\s*style-check keep:\s*\S/.test(comment)
        )
          report({
            line,
            level: 'must',
            message:
              '`style-check keep` without a reason: // style-check keep: <why the guide allows it>',
          });
    },
  }),
};

// A TODO names the ticket that will do it.
export default {
  id: 'todo-ticket',
  guide: 'CODING-STYLE § TODO comments must have a ticket number',
  check: ({ comments, report }) => ({
    finish() {
      for (const { comment, line } of comments)
        // A to-do starts a comment line (`// TODO …`, ` * TODO …`); prose that mentions one doesn't
        // count.
        if (
          /(^|\n)\s*(\/\/|\/\*+|\*)\s*TODO\b/.test(comment) &&
          !/TODO \([A-Z]+-\d+\)/.test(comment)
        )
          report({ line, level: 'must', message: 'TODO without a ticket: // TODO (MAV-123): …' });
    },
  }),
};

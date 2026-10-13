// Claude Design loads every library as a classic script, so React has to come
// from window globals instead of imports. This maps bare specifiers to them.
export function browserGlobals(globals) {
  const filter = new RegExp(`^(${Object.keys(globals).map((name) => name.replace('/', '\\/')).join('|')})$`);
  return {
    name: 'browser-globals',
    setup(build) {
      build.onResolve({ filter }, (args) => ({ path: args.path, namespace: 'browser-global' }));
      build.onLoad({ filter: /.*/, namespace: 'browser-global' }, (args) => ({
        contents: `module.exports = window.${globals[args.path]};`,
        loader: 'js',
      }));
    },
  };
}

const translations = require.context
  ? require.context("./", true, /\.yml$/).keys()
  : ['en-en'];

export default translations
  .map(t => t.replace(/\.\/(\w+-\w+)\.yml$/, '$1'));
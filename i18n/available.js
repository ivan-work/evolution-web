const translations = require.context("./", true, /\.yml$/);

export default translations.keys()
  .map(t => t.replace(/\.\/(\w+-\w+)\.yml$/, '$1'));
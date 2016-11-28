const translations = require.context("./", true, /\.yml$/);

export default translations.keys()
  .reduce(
    (acc, item) => ({
      ...acc,
      [item.replace(/\.\/(\w+-\w+)\.yml$/, "$1")]: true,
    }), {});
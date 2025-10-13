const nunjucks = require('nunjucks');

const nunjucksEnvironment = nunjucks.configure(['templates']);
nunjucksEnvironment.addFilter(
  'translate',
  (str, variables) => nunjucks.runtime.markSafe(translate(str, variables)),
);
nunjucksEnvironment.addFilter('name', (str) => str);

module.exports = nunjucks;

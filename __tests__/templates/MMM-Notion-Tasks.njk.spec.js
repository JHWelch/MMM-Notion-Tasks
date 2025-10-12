nunjucks = require('../../__mocks__/nunjucks');

translate = (str) => str;

let data;
let template;

describe('loading', () => {
  beforeEach(() => {
    data = { loading: true };
    template = nunjucks.render('MMM-Notion-Tasks.njk', data);
  });

  it('shows loading', () => {
    expect(template).toContain('LOADING');
  });
});

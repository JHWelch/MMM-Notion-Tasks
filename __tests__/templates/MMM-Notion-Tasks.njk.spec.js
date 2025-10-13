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

describe('with task data', () => {
  beforeEach(() => {
    data = { loading: false, tasks: [
      {
        id: 'page-id',
        name: 'Task 1',
        status: 'In Progress',
        assignee: 'User 1',
      },
      {
        id: 'page-id-2',
        name: 'Task 2',
        status: 'Not started',
        assignee: 'User 2',
      },
    ] };
    template = nunjucks.render('MMM-Notion-Tasks.njk', data);
  });

  it('has title', () => {
    expect(template).toContain('TASKS');
  });

  it('shows task list', () => {
    expect(template).toContain('Task 1');
    expect(template).toContain('Task 2');
    expect(template).toContain('User 1');
    expect(template).toContain('User 2');
  });
});

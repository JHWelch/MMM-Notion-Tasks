require('../__mocks__/Module');
require('../__mocks__/globalLogger');

const name = 'MMM-Notion-Tasks';

let MMMNotionTasks;

beforeEach(() => {
  jest.resetModules();
  require('../MMM-Notion-Tasks');

  MMMNotionTasks = global.Module.create(name);
  MMMNotionTasks.setData({ name, identifier: `Module_1_${name}` });
});

it('has a default config', () => {
  expect(MMMNotionTasks.defaults).toEqual({
    updateInterval: 60000,
    nameField: 'Name',
    statusField: 'Status',
    assigneeField: 'Assignee',
    nameFormat: 'full',
  });
});

it('requires expected version', () => {
  expect(MMMNotionTasks.requiresVersion).toBe('2.28.0');
});

it('inits module in loading state', () => {
  expect(MMMNotionTasks.loading).toBe(true);
});

describe('start', () => {
  const originalInterval = setInterval;
  const configObject = {
    notionToken: 'secret-token',
    dataSourceId: 'data-source-id',
    nameField: 'Name',
    statusField: 'Status',
    assigneeField: 'Assignee',
  };

  beforeEach(() => {
    MMMNotionTasks.setConfig(configObject);
    global.setInterval = jest.fn();
  });

  afterEach(() => {
    global.setInterval = originalInterval;
  });

  it('logs start of module', () => {
    MMMNotionTasks.start();

    expect(global.Log.info).toHaveBeenCalledWith('Starting module: MMM-Notion-Tasks');
  });

  it('requests data from node_helper with config variables', () => {
    MMMNotionTasks.start();

    expect(MMMNotionTasks.sendSocketNotification)
      .toHaveBeenCalledWith('MMM-Notion-Tasks-FETCH', configObject);
  });

  test('interval requests data from node_helper', () => {
    MMMNotionTasks.start();
    global.setInterval.mock.calls[0][0]();

    expect(MMMNotionTasks.sendSocketNotification).toHaveBeenCalledTimes(2);
    expect(MMMNotionTasks.sendSocketNotification)
      .toHaveBeenCalledWith('MMM-Notion-Tasks-FETCH', configObject);
  });

  test('interval set starts with default value', () => {
    MMMNotionTasks.setConfig({ updateInterval: 100000 });
    MMMNotionTasks.start();

    expect(global.setInterval)
      .toHaveBeenCalledWith(expect.any(Function), 100000);
  });

  it('registers nunjucks filters', () => {
    MMMNotionTasks.start();

    expect(MMMNotionTasks._nunjucksEnvironment.addFilter)
      .toHaveBeenCalledWith('name', expect.any(Function));
  });
});

describe('getTemplate', () => {
  it('returns template path', () => {
    expect(MMMNotionTasks.getTemplate()).toBe('templates/MMM-Notion-Tasks.njk');
  });
});

describe('getTemplateData', () => {
  it('returns template data when loading', () => {
    expect(MMMNotionTasks.getTemplateData()).toEqual({
      loading: true,
      tasks: [],
    });
  });

  it('returns template data when not loading', () => {
    MMMNotionTasks.loading = false;

    expect(MMMNotionTasks.getTemplateData()).toEqual({
      loading: false,
      tasks: [],
    });
  });

  it('returns any stored task data', () => {
    const data = { tasks: [
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
    MMMNotionTasks.loading = false;
    MMMNotionTasks.data = data;

    expect(MMMNotionTasks.getTemplateData()).toEqual({
      loading: false,
      tasks: data.tasks,
    });
  });
});

describe('getStyles', () => {
  it('returns styles path', () => {
    expect(MMMNotionTasks.getStyles()).toEqual([
      'font-awesome.css',
      'MMM-Notion-Tasks.css',
    ]);
  });
});

describe('socketNotificationReceived', () => {
  const payload = {
    tasks: [
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
    ],
  };

  describe('notification is MMM-Notion-Tasks-DATA', () => {
    it('sets loading to false', () => {
      MMMNotionTasks.socketNotificationReceived('MMM-Notion-Tasks-DATA', payload);

      expect(MMMNotionTasks.loading).toBe(false);
    });

    it('sets task data', () => {
      MMMNotionTasks.socketNotificationReceived('MMM-Notion-Tasks-DATA', payload);

      expect(MMMNotionTasks.data.tasks).toBe(payload.tasks);
    });

    it('updates dom', () => {
      MMMNotionTasks.socketNotificationReceived('MMM-Notion-Tasks-DATA', payload);

      expect(MMMNotionTasks.updateDom).toHaveBeenCalled();
    });
  });

  describe('notification is not MMM-Notion-Tasks-DATA', () => {
    it('does not set data', () => {
      MMMNotionTasks.socketNotificationReceived('NOT-MMM-Notion-Tasks-DATA', payload);

      expect(MMMNotionTasks.data.stops).toEqual(undefined);
    });
  });
});

describe('addFilters', () => {
  describe('name filter', () => {
    const getFilter = () => MMMNotionTasks.nunjucksEnvironment()
      .addFilter.mock.calls
      .find((call) => call[0] === 'name')[1];

    it('registers a name filter', () => {
      MMMNotionTasks.addFilters();

      expect(MMMNotionTasks.nunjucksEnvironment().addFilter)
        .toHaveBeenCalledWith('name', expect.any(Function));
    });

    it('name filter returns name', () => {
      MMMNotionTasks.addFilters();
      const nameFilter = getFilter();

      expect(nameFilter('Jordan Welch')).toBe('Jordan Welch');
    });

    describe('config set to first name', () => {
      it('name filter returns first name', () => {
        MMMNotionTasks.config.nameFormat = 'first';
        MMMNotionTasks.addFilters();
        const nameFilter = getFilter();

        expect(nameFilter('Jordan Welch')).toBe('Jordan');
      });
    });

    describe('config set to last name', () => {
      it('name filter returns last name', () => {
        MMMNotionTasks.config.nameFormat = 'last';
        MMMNotionTasks.addFilters();
        const nameFilter = getFilter();

        expect(nameFilter('Jordan Welch')).toBe('Welch');
      });
    });

    describe('config set to initials', () => {
      it('name filter returns initials', () => {
        MMMNotionTasks.config.nameFormat = 'initials';
        MMMNotionTasks.addFilters();
        const nameFilter = getFilter();

        expect(nameFilter('Jordan Welch')).toBe('JW');
      });
    });

    describe('config set to full name', () => {
      it('name filter returns full name', () => {
        MMMNotionTasks.config.nameFormat = 'full';
        MMMNotionTasks.addFilters();
        const nameFilter = getFilter();

        expect(nameFilter('Jordan Welch')).toBe('Jordan Welch');
      });
    });
  });
});

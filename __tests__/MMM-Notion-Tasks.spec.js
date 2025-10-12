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
    });
  });

  it('returns template data when not loading', () => {
    MMMNotionTasks.loading = false;

    expect(MMMNotionTasks.getTemplateData()).toEqual({
      loading: false,
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
  const payload = {};

  describe('notification is MMM-Notion-Tasks-DATA', () => {
    it('sets loading to false', () => {
      MMMNotionTasks.socketNotificationReceived('MMM-Notion-Tasks-DATA', payload);

      expect(MMMNotionTasks.loading).toBe(false);
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

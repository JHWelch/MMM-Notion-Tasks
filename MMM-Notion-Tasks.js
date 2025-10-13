/* global Module */

/* Magic Mirror
 * Module: MMM-Notion-Tasks
 *
 * By Jordan Welch
 * MIT Licensed.
 */

Module.register('MMM-Notion-Tasks', {
  defaults: {
    updateInterval: 60000,
    assigneeField: 'Assignee',
    dueDateField: 'Due',
    nameField: 'Name',
    statusField: 'Status',
    doneStatuses: ['Done'],
    nameFormat: 'full',
  },

  requiresVersion: '2.28.0',

  loading: true,

  start () {
    Log.info(`Starting module: ${this.name}`);
    const self = this;

    this.addFilters();
    this.getData();

    setInterval(() => {
      self.getData();
    }, this.config.updateInterval);
  },

  getData () {
    this.sendSocketNotification('MMM-Notion-Tasks-FETCH', {
      notionToken: this.config.notionToken,
      dataSourceId: this.config.dataSourceId,
      assigneeField: this.config.assigneeField,
      dueDateField: this.config.dueDateField,
      nameField: this.config.nameField,
      statusField: this.config.statusField,
      doneStatuses: this.config.doneStatuses,
    });
  },

  getTemplate () {
    return 'MMM-Notion-Tasks.njk';
  },

  getTemplateData () {
    return {
      loading: this.loading,
      tasks: this.data?.tasks || [],
    };
  },

  getStyles () {
    return [
      'font-awesome.css',
      'MMM-Notion-Tasks.css',
    ];
  },

  getTranslations () {
    return {
      en: 'translations/en.json',
      es: 'translations/es.json',
    };
  },

  socketNotificationReceived (notification, payload) {
    if (notification !== 'MMM-Notion-Tasks-DATA') {
      return;
    }

    this.loading = false;
    this.data.tasks = payload.tasks;
    this.updateDom(300);
  },

  addFilters () {
    this.nunjucksEnvironment().addFilter('name', (name) => {
      switch (this.config.nameFormat) {
        case 'first':
          return name.split(' ')[0];
        case 'last':
          return name.split(' ').slice(-1).join(' ');
        case 'initials':
          return name.split(' ').map((n) => n[0]).join('');
        case 'full':
        default:
          return name;
      }
    });
  },
});

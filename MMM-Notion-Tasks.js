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
  },

  requiresVersion: '2.28.0',

  loading: true,

  start () {
    Log.info(`Starting module: ${this.name}`);
    const self = this;

    this.getData();

    setInterval(() => {
      self.getData();
    }, this.config.updateInterval);
  },

  getData () {
    this.sendSocketNotification('MMM-Notion-Tasks-FETCH', {
      notionToken: this.config.notionToken,
      dataSourceId: this.config.dataSourceId,
    });
  },

  getTemplate () {
    return 'templates/MMM-Notion-Tasks.njk';
  },

  getTemplateData () {
    return {
      loading: this.loading,
      tasks: this.data?.tasks || [],
    };
  },

  getScripts () {
    return [];
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
});

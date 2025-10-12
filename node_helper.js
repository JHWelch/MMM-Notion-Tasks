/* Magic Mirror
 * Node Helper: MMM-Notion-Tasks
 *
 * By Jordan Welch
 * MIT Licensed.
 */

// const Log = require('logger');
const NodeHelper = require('node_helper');
const { Client } = require('@notionhq/client');

module.exports = NodeHelper.create({
  socketNotificationReceived (notification, payload) {
    if (notification !== 'MMM-Notion-Tasks-FETCH') {
      return;
    }

    this.getData(payload);
  },

  async getData ({
    notionToken,
    databaseId,
  }) {
    const notion = new Client({ auth: notionToken });

    const response = await notion.dataSources.query({
      database_id: databaseId,
    });

    const tasks = response.results.map((page) => ({
      id: page.id,
      name: page.properties.Name.title[0]?.text.content || 'No Name',
      status: page.properties.Status.select?.name || 'No Status',
    }));
    this.sendSocketNotification('MMM-Notion-Tasks-DATA', { tasks });
  },
});

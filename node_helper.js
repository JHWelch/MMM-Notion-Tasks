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
    dataSourceId,
    nameField,
    statusField,
    assigneeField,
  }) {
    const notion = new Client({ auth: notionToken });

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: 'Status',
            status: {
              does_not_equal: 'Done',
            },
          },
          {
            property: 'Due Date',
            date: {
              on_or_before: (new Date()).toISOString().split('T')[0],
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Due Date',
          direction: 'ascending',
        },
      ],
    });

    const tasks = response.results.map((page) => ({
      id: page.id,
      name: page.properties[nameField].title[0]?.text.content || '-',
      status: page.properties[statusField].select?.name || '-',
      assignee: page.properties[assigneeField].people[0]?.name || '-',
    }));

    this.sendSocketNotification('MMM-Notion-Tasks-DATA', { tasks });
  },
});

/* global moment */

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
    assigneeField,
    dueDateField,
    nameField,
    statusField,
    doneStatuses,
  }) {
    const notion = new Client({ auth: notionToken });

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          ...doneStatuses.map((doneStatus) => ({
            property: statusField,
            status: { does_not_equal: doneStatus },
          })),
          {
            property: dueDateField,
            date: {
              on_or_before: (new Date()).toISOString().split('T')[0],
            },
          },
        ],
      },
      sorts: [
        {
          property: dueDateField,
          direction: 'ascending',
        },
      ],
    });

    const today = (new Date()).toISOString().split('T')[0];
    const tasks = response.results.map((page) => ({
      id: page.id,
      name: page.properties[nameField].title[0]?.text.content || '-',
      status: page.properties[statusField].select?.name || '-',
      assignee: page.properties[assigneeField].people[0]?.name || '-',
      isPastDue: page.properties[dueDateField].date?.start < today,
    }));

    this.sendSocketNotification('MMM-Notion-Tasks-DATA', { tasks });
  },

  today () {
    return moment()
      .tz(process.env.TZ ?? 'UTC') // eslint-disable-line no-undef
      .startOf('day')
      .format('YYYY-MM-DD');
  },
});

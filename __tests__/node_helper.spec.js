const { Client } = require('@notionhq/client');

let helper;

beforeEach(() => {
  helper = require('../node_helper.js');
  helper.setName('MMM-Notion-Tasks');
});

describe('socketNotificationReceived', () => {
  describe('notification does not match MMM-Notion-Tasks-FETCH', () => {
    it('does nothing', () => {
      helper.socketNotificationReceived('NOT-Notion-Tasks-FETCH', {});

      expect(helper.sendSocketNotification).not.toHaveBeenCalled();
    });
  });

  describe('notification matches MMM-Notion-Tasks-FETCH', () => {
    let query;

    beforeEach(() => {
      query = jest.fn();
      Client.mockImplementation(() => ({
        dataSources: { query },
      }));
      const date = new Date(2023, 9, 1); // October 1, 2023
      jest.useFakeTimers().setSystemTime(date);
      query.mockImplementation(() => Promise.resolve({ results: [
        {
          object: 'page',
          id: 'page-id',
          properties: {
            Name: { title: [{ text: { content: 'Task 1' } }] },
            Status: { select: { name: 'In Progress' } },
            Assignee: { people: [{ name: 'User 1' }] },
            'Due Date': { date: { start: '2023-09-30' } },
          },
        },
        {
          object: 'page',
          id: 'page-id-2',
          properties: {
            Name: { title: [{ text: { content: 'Task 2' } }] },
            Status: { select: { name: 'Not started' } },
            Assignee: { people: [{ name: 'User 2' }] },
            'Due Date': { date: { start: '2023-10-01' } },
          },
        },
      ] }));
    });

    it('fetches tasks from Notion', async () => {
      await helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', {
        notionToken: 'secret-token',
        dataSourceId: 'data-source-id',
        nameField: 'Name',
        statusField: 'Status',
        assigneeField: 'Assignee',
      });

      expect(helper.sendSocketNotification).toHaveBeenCalledWith('MMM-Notion-Tasks-DATA', {tasks: [
        {
          id: 'page-id',
          name: 'Task 1',
          status: 'In Progress',
          assignee: 'User 1',
          isPastDue: true,
        },
        {
          id: 'page-id-2',
          name: 'Task 2',
          status: 'Not started',
          assignee: 'User 2',
          isPastDue: false,
        },
      ]});
    });

    it('calls notion with correct parameters', () => {
      helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', {
        notionToken: 'secret-token',
        dataSourceId: 'data-source-id',
        nameField: 'Name',
        statusField: 'Status',
        assigneeField: 'Assignee',
      });

      expect(query).toHaveBeenCalledWith({
        data_source_id: 'data-source-id',
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
    });
  });
});

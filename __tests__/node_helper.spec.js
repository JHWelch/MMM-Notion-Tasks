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

      query.mockImplementation(() => Promise.resolve({ results: [
        {
          object: 'page',
          id: 'page-id',
          properties: {
            Name: { title: [{ text: { content: 'Task 1' } }] },
            Status: { select: { name: 'In Progress' } },
          },
        },
        {
          object: 'page',
          id: 'page-id-2',
          properties: {
            Name: { title: [{ text: { content: 'Task 2' } }] },
            Status: { select: { name: 'Completed' } },
          },
        },
      ] }));
    });

    it('fetches tasks from Notion', async () => {
      await helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', {
        notionToken: 'secret-token',
        databaseId: 'database-id',
      });

      expect(helper.sendSocketNotification).toHaveBeenCalledWith('MMM-Notion-Tasks-DATA', {tasks: [
        { id: 'page-id', name: 'Task 1', status: 'In Progress' },
        { id: 'page-id-2', name: 'Task 2', status: 'Completed' },
      ]});
    });

    it('calls notion with correct parameters', () => {
      helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', {
        notionToken: 'secret-token',
        databaseId: 'database-id',
      });

      expect(query).toHaveBeenCalledWith({
        data_source_id: 'database-id',
      });
    });
  });
});

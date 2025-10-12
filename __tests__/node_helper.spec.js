const { Client } = require('@notionhq/client');

beforeAll(() => {
  require('../__mocks__/logger');
});

let helper;

beforeEach(() => {
  helper = require('../node_helper');
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
    it('fetches tasks from Notion', async () => {
      const query = jest.fn();
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

      await helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', {
        notionToken: 'secret-token',
        databaseId: 'database-id',
      });

      expect(helper.sendSocketNotification).toHaveBeenCalledWith('MMM-Notion-Tasks-DATA', {tasks: [
        { id: 'page-id', name: 'Task 1', status: 'In Progress' },
        { id: 'page-id-2', name: 'Task 2', status: 'Completed' },
      ]});
    });
  });
});

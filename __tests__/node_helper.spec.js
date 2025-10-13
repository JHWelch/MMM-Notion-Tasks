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

    describe('default arguments', () => {
      const config = {
        notionToken: 'secret-token',
        dataSourceId: 'data-source-id',
        assigneeField: 'Assignee',
        dueDateField: 'Due Date',
        nameField: 'Name',
        statusField: 'Status',
        doneStatuses: ['Done'],
      };

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
        await helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', config);

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
        helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', config);

        expect(query).toHaveBeenCalledWith({
          data_source_id: 'data-source-id',
          filter: {
            and: [
              {
                property: 'Status',
                status: { does_not_equal: 'Done' },
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

    describe('field names are customized', () => {
      const config = {
        notionToken: 'secret-token',
        dataSourceId: 'data-source-id',
        assigneeField: 'CustomAssigneeField',
        dueDateField: 'CustomDueDateField',
        nameField: 'CustomNameField',
        statusField: 'CustomStatusField',
        doneStatuses: ['Deployed', 'Canceled'],
      };

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
              CustomNameField: { title: [{ text: { content: 'Task 1' } }] },
              CustomStatusField: { select: { name: 'In Progress' } },
              CustomAssigneeField: { people: [{ name: 'User 1' }] },
              CustomDueDateField: { date: { start: '2023-09-30' } },
            },
          },
          {
            object: 'page',
            id: 'page-id-2',
            properties: {
              CustomNameField: { title: [{ text: { content: 'Task 2' } }] },
              CustomStatusField: { select: { name: 'Not started' } },
              CustomAssigneeField: { people: [{ name: 'User 2' }] },
              CustomDueDateField: { date: { start: '2023-10-01' } },
            },
          },
        ] }));
      });

      it('fetches tasks from Notion', async () => {
        await helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', config);

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
        helper.socketNotificationReceived('MMM-Notion-Tasks-FETCH', config);

        expect(query).toHaveBeenCalledWith({
          data_source_id: 'data-source-id',
          filter: {
            and: [
              {
                property: 'CustomStatusField',
                status: { does_not_equal: 'Deployed' },
              },
              {
                property: 'CustomStatusField',
                status: { does_not_equal: 'Canceled' },
              },
              {
                property: 'CustomDueDateField',
                date: {
                  on_or_before: (new Date()).toISOString().split('T')[0],
                },
              },
            ],
          },
          sorts: [
            {
              property: 'CustomDueDateField',
              direction: 'ascending',
            },
          ],
        });
      });
    });
  });
});

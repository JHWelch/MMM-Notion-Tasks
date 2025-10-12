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
});

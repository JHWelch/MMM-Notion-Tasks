/* Magic Mirror
 * Node Helper: MMM-Notion-Tasks
 *
 * By Jordan Welch
 * MIT Licensed.
 */

// const Log = require('logger');
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
  socketNotificationReceived (notification, _payload) {
    if (notification !== 'MMM-Notion-Tasks-FETCH') {
      return;
    }

    this.getData();
  },

  async getData () {
    this.sendSocketNotification('MMM-Notion-Tasks-DATA');
  },
});

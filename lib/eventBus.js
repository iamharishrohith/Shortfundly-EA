const EventEmitter = require('events');

class CampaignEventBus extends EventEmitter {}

// Global singleton across API routes
if (!global.__campaignEventBus) {
  global.__campaignEventBus = new CampaignEventBus();
}

module.exports = global.__campaignEventBus;

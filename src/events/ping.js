'use strict';

const Events = require('./../structures/Events');

class Ping extends Events{
  constructor(client) {
    super(client, 'ping', {});
  };

  handle(ping) {
    console.log('[*] PING: %s ms', ping);
  };
};

module.exports = exports = Ping;
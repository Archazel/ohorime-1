'use strict';

const Events = require('./../structures/Events');

class Debug extends Events{
  constructor(client) {
    super(client, 'debug', {});
  };

  handle(ctx) {
    console.log(ctx);
  };
};

module.exports = exports = Debug;
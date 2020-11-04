'use strict';

const Events = require('./../structures/Events');

class Raw extends Events {
  constructor(client) {
    super(client, 'raw', {});
  };

  handle(...args) {
    // console.log(...args);
  };
};

module.exports = exports = Raw;
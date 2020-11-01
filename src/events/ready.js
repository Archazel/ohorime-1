'use strict';

const Events = require('./../structures/Events');
const erlpack = require('erlpack');

class Ready extends Events{
  constructor(client) {
    super(client, 'READY', {});
  };

  handle(ctx) {
    this.client.shard = ctx.shard;
    this.client.application = ctx.application;

    this.client.redis.socket.set('user', JSON.stringify(ctx.user));

    console.log('[*] %s connected', ctx.user.username);
  };
};

module.exports = exports = Ready;
'use strict';

const Events = require('./../structures/Events');

class Ready extends Events{
  constructor(client) {
    super(client, 'READY', {});
  };

  handle(ctx) {
    this.client.shard = ctx.shard;
    this.client.application = ctx.application;

    this.client.redis.socket.set('user', JSON.stringify(ctx.user));

    console.log('[*] %s connected | shard %s/%s', ctx.user.username, parseInt(process.env.shardID)+1, process.env.shardCount);
  };
};

module.exports = exports = Ready;
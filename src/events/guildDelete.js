'use strict';

const Events = require('./../structures/Events');

class GuildDelete extends Events{
  constructor(client) {
    super(client, 'GUILD_DELETE', {});
  };

  handle(guild) {
    this.client.redis.socket.del(`guild_${guild.id}`);
  };
};

module.exports = exports = GuildDelete;
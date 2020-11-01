'use strict';

const Events = require('./../structures/Events');

class GuildUpdate extends Events{
  constructor(client) {
    super(client, 'GUILD_UPDATE', {});
  };

  handle(guild) {
    this.client.redis.socket.set(`guild_${guild.id}`, JSON.stringify(guild));
  };
};

module.exports = exports = GuildUpdate;
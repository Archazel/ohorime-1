'use strict';

const Events = require('./../structures/Events');
const erlpack = require('erlpack');

class GuildUpdate extends Events{
  constructor(client) {
    super(client, 'GUILD_UPDATE', {});
  };

  handle(guild) {
    this.client.redis.socket.set(`guild_${guild.id}`, erlpack.pack(guild));
  };
};

module.exports = exports = GuildUpdate;
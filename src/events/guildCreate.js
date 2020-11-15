'use strict';

const Events = require('./../structures/Events');
const mongoose = require('mongoose');
const erlpack = require('erlpack');

class GuildCreate extends Events{
  constructor(client) {
    super(client, 'GUILD_CREATE', {});
  };

  async handle(guild) {
    this.client.ws.send(erlpack.pack({
      op: 8,
      d: {
        guild_id: guild.id,
        query: '',
        limit: 0,
      },
    }));

    mongoose.model('Guilds').exists({id: guild.id}, (err, exist) => {
      if (err) throw Error(err);
      if (exist) return;
      mongoose.model('Guilds').create({
        id: guild.id,
      });
    });

    this.client.redis.socket.set(`guild_${guild.id}`, JSON.stringify(guild));
  };
};

module.exports = exports = GuildCreate;
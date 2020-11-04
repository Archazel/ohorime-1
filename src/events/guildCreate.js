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

    mongoose.model('Guilds').findOne({id: guild.id}, (err, _guild) => {
      if (Boolean(_guild)) return;
      mongoose.model('Guilds').create({
        id: guild.id,
      });
    });

    Object.values(guild.members).filter((member) => !member.user.bot).forEach(async (member) => {

      mongoose.model('Users').findOne({id: member.user.id}, (err, user) => {
        if (user) return;
        mongoose.model('Users').create({
          id: member.user.id,
        });
      });
    });

    this.client.redis.socket.set(`guild_${guild.id}`, JSON.stringify(guild));
  };
};

module.exports = exports = GuildCreate;
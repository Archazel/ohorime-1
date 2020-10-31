'use strict';

const Events = require('./../structures/Events');
const erlpack = require('erlpack');
const mongoose = require('mongoose');
const messageCreate = require('./messageCreate');

class GuildCreate extends Events{
  constructor(client) {
    super(client, 'GUILD_CREATE', {});
  };

  async handle(guild) {
    mongoose.model('Guilds').findOne({id: guild.id}, (err, _guild) => {
      if (Boolean(_guild)) return;
      mongoose.model('Guilds').create({
        id: guild.id,
      });
    });

    Object.values(guild.members).filter((member) => !member.user.bot).forEach(async (member) => {
      mongoose.model('Users').findOne({id: member.id}, (err, user) => {
        if (user) return;
        mongoose.model('Users').create({
          id: member.id,
        });
      });
    });

    this.client.redis.socket.set(`guild_${guild.id}`, erlpack.pack(guild));
  };
};

module.exports = exports = GuildCreate;
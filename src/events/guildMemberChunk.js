'use strict';

const Events = require('./../structures/Events');
const mongoose = require('mongoose');

class GuildMemberChunk extends Events{
  constructor(client) {
    super(client, 'GUILD_MEMBERS_CHUNK', {});
  };

  async handle(chunk) {
    let guild = await this.client.redis.socket.get(`guild_${chunk.guild_id}`).then(JSON.parse);

    for (const member of chunk.members) {
      if (!guild.members.some((_member) => _member.user.id == member.user.id)) {
        guild.members.push(member);
      };
    };

    Object.values(chunk.members).filter((member) => !member.user.bot).forEach(async (member) => {

      mongoose.model('Users').exists({id: member.user.id}, (err, exist) => {
        if (exist) return;
        mongoose.model('Users').create({
          id: member.user.id,
        });
      });
    });

    this.client.redis.socket.set(`guild_${chunk.guild_id}`, JSON.stringify(guild));

    if (chunk.chunk_count <= chunk.chunk_index) {
      this.client.ws.send(erlpack.pack({
        op: 8,
        d: {
          guild_id: chunk.guild_id,
          query: '',
          limit: 0,
          user_ids: chunk.members.pop()?.user?.id,
        },
      }));
    } else {
      mongoose.model('Leveling').find({id: guild.id}, ['userID'], (err, lvl) => {
        for (const {userID: id} of lvl) {
          if (!Boolean(guild.members.find((member) => member.user.id) == id)) {
            lvl.updateOne({
              actif: false,
            });
          };
        };
      });
    };
  };
};

module.exports = exports = GuildMemberChunk;
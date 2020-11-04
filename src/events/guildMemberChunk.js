'use strict';

const Events = require('./../structures/Events');

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
    };
  };
};

module.exports = exports = GuildMemberChunk;
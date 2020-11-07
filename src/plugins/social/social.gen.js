'use strict';

const Commands = require('../../structures/Commands');
const {parseMention} = require('../../util/Util');

class Social extends Commands {
  constructor(client, pregenerate) {
    super(client, pregenerate.name, {
      memberPermissions: pregenerate.memberPermissions || [],
      mePermissions: pregenerate.mePermissions || [],
      type: 'GENERATE'
    });

    this.pregenerate = pregenerate;
  };

  async handle(message, args) {
    const mention = message.guild.members.find((member) => member.user.id == parseMention(args)?.nickname[1]);

    const api = await this.client.yokoso.get(`/sfw/${this.name}`).then((response) => response.data);

    return message.channel.createMessage({
      data: {
        embed: {
          description: !mention ?
            `<@${message.bot.id}> ${this.name} <@${message.author.id}>` : `<@${message.author.id}> ${this.name} <@${mention?.user?.id}>`,
          color: parseInt('0x' + message.db.user.color),
          image: {
            url: api.url,
          },
        },
      },
    });
  };
};

module.exports = exports = Social;
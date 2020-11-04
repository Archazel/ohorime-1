'use strict';

const Commands = require('../../structures/Commands');
const {parseMention} = require('./../../util/Util');
const {ChannelNode} = require('kobu-lib');

class Eat extends Commands {
  constructor(client) {
    super(client, 'eat', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  async handle(message, args) {
    const mention = message.guild.members.find((member) => member.user.id == parseMention(args)?.nickname[1]);


    const api = await this.client.yokoso.get(`/sfw/${this.name}`).then((response) => response.data);

    new ChannelNode(this.client).createMessage(message.channel_id, {
      data: {
        embed: {
          description: !mention ?
            `<@${message.bot.id}> eat <@${message.author.id}>` : `<@${message.author.id}> eat <@${mention?.user?.id}>`,
          color: parseInt('0x' + message.db.user.color),
          image: {
            url: api.url,
          },
        },
      },
    });
  };
};

module.exports = exports = Eat;
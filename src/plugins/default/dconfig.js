'use strict';

const Commands = require('../../structures/Commands');
const {ChannelNode} = require('kobu-lib');

class Config extends Commands {
  constructor(client) {
    super(client, 'config', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINK'],
    });
  };

  handle(message, args) {
    const channel = new ChannelNode(this.client);
    if (!args.join('')) return channel.createMessage(message.channel_id, {
      data: {
        embed: {
          description: `Personal commands: \`color\`, \`background\`, \`prefix\`${message.member.bitfield.has('MANAGE_GUILD') ? '\nGuild commands: `plugins`' : ''}`,
          color: parseInt('0x' + message.db.user.color) || 0x00
        },
      },
    });
  };
};

module.exports = exports = Config;
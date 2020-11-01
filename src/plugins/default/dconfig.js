'use strict';

const Commands = require('../../structures/Commands');
const {ChannelNode} = require('kobu-lib');

class Config extends Commands {
  constructor(client) {
    super(client, 'config', {});
  };

  handle(message, args) {
    const channel = new ChannelNode(this.client);
    if (!args.join('')) return channel.createMessage(message.channel_id, {
      data: {
        embed: {
          description: 'personal commands: `color`, `background`, `prefix`',
        },
      },
    });
  };
};

module.exports = exports = Config;
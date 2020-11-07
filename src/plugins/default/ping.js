'use strict';

const Commands = require('./../../structures/Commands');
const {ChannelNode} = require('kobu-lib');

class Ping extends Commands {
  constructor(client) {
    super(client, 'ping', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  handle(message, args) {
    message.channel.createMessage({
      data: {
        embed: {
          description: `Ping 🏓 [${this.client.ping || 'x'} ms]\nRam 🚀 [${
            (process.memoryUsage()
                .heapUsed / 1024 / 1024 / 1024).toFixed(2)} / ${
            (require('os').totalmem() / 1024 / 1024 / 1024).toFixed(2)
          } gb]`,
          color: parseInt('0x' + message.db.user.color) || 0x000,
        },
      },
    });
  };
};

module.exports = exports = Ping;
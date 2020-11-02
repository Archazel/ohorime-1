'use strict';

const Commands = require('./../../structures/Commands');
const {ChannelNode} = require('kobu-lib');

class Help extends Commands {
  constructor(client) {
    super(client, 'help', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINK'],
    });
  };

  handle(message, args) {
    const channel = new ChannelNode(this.client);

    const embed = {
      description: 'Plugins list',
      color: parseInt('0x' + message.db.user.color) || 0x000,
      fields: this.client.plugins.map((plugin) => ({
        name: `${plugin.commands.size} • ${plugin.name} [${plugin.name != 'default' ?
          message.db.guild.bitfield.has(plugin.name.toUpperCase()) ? 'enabled' : 'disabled' :
          'enabled'}]`,
        value: plugin.commands.map((command) => `\`${command.name}\``).join(', '),
      })),
    };

    channel.createMessage(message.channel_id, {
      data: {
        embed: embed,
      },
    });
  };
};

module.exports = exports = Help;
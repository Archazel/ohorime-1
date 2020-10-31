'use strict';

const Commands = require('./../../structures/Commands');
const {ChannelNode} = require('kobu-lib');

class Help extends Commands {
  constructor(client) {
    super(client, 'help', {});
  };

  handle(message, args) {
    const channel = new ChannelNode(this.client);

    const flags = message.db.guild.bitfield.resolve().map((v) => v.toLowerCase());

    flags.push('default');

    const embed = {
      description: 'Plugins list',
      color: parseInt('0x' + message.db.user.color) || 0x000,
      fields: this.client.plugins.map((plugin) => ({
        name: `${plugin.commands.size} • ${plugin.name} [${
          flags.includes(plugin.name) ? 'enabled' : 'disabled'}]`,
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
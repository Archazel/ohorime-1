'use strict';

const Commands = require('./../../structures/Commands');

class Help extends Commands {
  constructor(client) {
    super(client, 'help', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  handle(message, args) {
    const embed = {
      description: 'Plugins list',
      color: parseInt('0x' + message.db.user.color) || 0x000,
      fields: this.client.plugins.filter((plugin) => !plugin.data.hidden).map((plugin) => ({
        name: `${plugin.commands.size} • ${plugin.name} [${plugin.name != 'default' ?
          message.db.guild.bitfield.has(plugin.name.toUpperCase()) ? 'enabled' : 'disabled' :
          'enabled'}]`,
        value: plugin.commands.map((command) => `\`${command.name}\``).join(', '),
      })),
    };

    message.channel.createMessage({
      data: {
        embed: embed,
      },
    });
  };
};

module.exports = exports = Help;
'use strict';

const Commands = require('../../structures/Commands');
const {ChannelNode} = require('kobu-lib');
const mongoose = require('mongoose');
const {flags: {PLUGINS}} = require('./../../util/Constant');
const BitField = require('../../util/BitField');

class Config extends Commands {
  constructor(client) {
    super(client, 'config', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });

    this.color = [
      {tag: 'white', code: 'ffffff'}, {tag: 'silver', code: 'c0c0c0'}, {tag: 'gray', code: '808080'}, {tag: 'black', code: '000000'}, {tag: 'red', code: 'ff0000'}, {tag: 'maroon', code: '800000'}, {tag: 'yellow', code: 'ffff00'}, {tag: 'olive', code: '808000'}, {tag: 'lime', code: '00ff00'}, {tag: 'green', code: '008000'}, {tag: 'aqua', code: '00ffff'}, {tag: 'teal', code :'008050'}, {tag: 'blue', code: '0000ff'}, {tag: 'navy', code: '000080'}, {tag: 'fuchsia', code: 'ff00ff'}, {tag: 'purple', code: '800080'},
    ];
  };

  async handle(message, args) {
    const channel = new ChannelNode(this.client);
    let enableGuild = message.member.bitfield.has('MANAGE_GUILD');

    if (!args.join('')) return channel.createMessage(message.channel_id, {
      data: {
        embed: {
          description: `Personal commands: \`color\`, \`prefix\`${enableGuild ? '\nGuild commands: `plugins`' : ''}`,
          color: parseInt('0x' + message.db.user.color) || 0x00
        },
      },
    });

    const setter = args.shift();

    if (setter == 'color') {
      if (!args.join('')) return channel.createMessage(message.channel_id, {
        data: {
          embed: {
            description: 'Please enter a valid color code',
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });

      let argColor = args.join('').trim();

      if (argColor.startsWith('#')) argColor = argColor.slice(1);

      const color = this.color.find((c) => c.tag == argColor.toLowerCase())?.code || argColor;

      return await mongoose.model('Users').findOneAndUpdate({
        id: message.db.user.id,
      }, {
        color,
      }).then((old) => {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: `🎊 Color updated ${old.color} -> ${color}`,
              color: parseInt('0x' + color) || 0x00
            },
          },
        });
      });
    } else if (setter == 'prefix') {
      if (!args.join('')) return channel.createMessage(message.channel_id, {
        data: {
          embed: {
            description: 'Please enter a valid prefix',
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });

      const argPrefix = args.join('').trim();

      return await mongoose.model('Users').findOneAndUpdate({
        id: message.db.user.id,
      }, {
        prefix: argPrefix,
      }).then((old) => {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: `🎊 Prefix updated ${old.prefix} -> ${argPrefix}`,
              color: parseInt('0x' + message.db.user.color) || 0x00
            },
          },
        });
      });
    } else if (setter == 'plugins') {
      if (!enableGuild) {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: 'You missing permissions: `manage_guild`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      const plugins = [
        'all',
        ...this.client.plugins.filter((plugin) => plugin.name != 'default').map((plugin) => plugin.name),
      ];

      const invalidArg = `Plugins lists: \`${plugins.join('`, `')}\`\nActions: \`enable\`, \`disable\``;

      if (!args.join('')) {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: invalidArg,
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      const argPlugins = args.shift().trim();
      const actionPlugins = args.join('').trim();

      if (!plugins.includes(argPlugins)) {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: invalidArg,
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      if (!actionPlugins || (actionPlugins != 'enable' && actionPlugins != 'disable')) {
        return channel.createMessage(message.channel_id, {
          data: {
            embed: {
              description: `Actions: \`${argPlugins} enable/disable\``,
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      if (argPlugins == 'all') {
        let flags = 0;
        if (actionPlugins == 'enable') {
          flags = Object.values(PLUGINS).reduce((a, b) => a | b);
        };

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: flags,
        }).then((old) => {
          return channel.createMessage(message.channel_id, {
            data: {
              embed: {
                description: `🎊 Plugins updated ${old.plugins} -> ${flags}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      } else {
        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);
        if (actionPlugins == 'enable') {
          bitfield.add(bitfield.flags[argPlugins.toUpperCase()]);
        } else {
          bitfield.remove(bitfield.flags[argPlugins.toUpperCase()]);
        };

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
        }).then((old) => {
          return channel.createMessage(message.channel_id, {
            data: {
              embed: {
                description: `🎊 Plugins updated ${old.plugins} -> ${bitfield.bit}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      };
    };
  };
};

module.exports = exports = Config;
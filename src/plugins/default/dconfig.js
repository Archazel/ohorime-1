'use strict';

const Commands = require('../../structures/Commands');
const mongoose = require('mongoose');
const {flags: {PLUGINS, PERMISSION}} = require('./../../util/Constant');
const BitField = require('../../util/BitField');
const {parseMention, computePermissions} = require('../../util/Util');

class Config extends Commands {
  constructor(client) {
    super(client, 'config', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });

    this.color = [
      { tag: 'white', code: 'ffffff' }, { tag: 'silver', code: 'c0c0c0' }, { tag: 'gray', code: '808080' }, { tag: 'black', code: '000000' }, { tag: 'red', code: 'ff0000' }, { tag: 'maroon', code: '800000' }, { tag: 'yellow', code: 'ffff00' }, { tag: 'olive', code: '808000' }, { tag: 'lime', code: '00ff00' }, { tag: 'green', code: '008000' }, { tag: 'aqua', code: '00ffff' }, { tag: 'teal', code: '008050' }, { tag: 'blue', code: '0000ff' }, { tag: 'navy', code: '000080' }, { tag: 'fuchsia', code: 'ff00ff' }, { tag: 'purple', code: '800080' },
    ];
  };

  async handle(message, args) {
    let enableGuild = message.member.bitfield.has('MANAGE_GUILD');

    if (!args.join('')) return message.channel.createMessage({
      data: {
        embed: {
          description: `Personal commands: \`color\`, \`prefix\`${enableGuild ?
            '\nGuild commands: `plugins`, `starboard`, `welcome`, `goodbye`' :
            ''}\n\nShow my config: \`me\`\nShow guild config: \`guild\``,
          color: parseInt('0x' + message.db.user.color) || 0x00
        },
      },
    });

    const setter = args.shift();

    if (setter == 'color') {
      if (!args.join('')) return message.channel.createMessage({
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
        return message.channel.createMessage({
          data: {
            embed: {
              description: `🎊 Color updated ${old.color} -> ${color}`,
              color: parseInt('0x' + color) || 0x00
            },
          },
        });
      });
    } else if (setter == 'prefix') {
      if (!args.join('')) return message.channel.createMessage({
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
        return message.channel.createMessage({
          data: {
            embed: {
              description: `🎊 Prefix updated ${old.prefix} -> ${argPrefix}`,
              color: parseInt('0x' + message.db.user.color) || 0x00
            },
          },
        });
      });
    } else if (setter == 'me') {
      return message.channel.createMessage({
        data: {
          embed: {
            description: 'Your personnal config',
            fields: [
              {
                name: '⚜️ Color',
                value: message.db.user.color,
                inline: true,
              },
              {
                name: '🔑 Prefix',
                value: message.db.user.prefix,
                inline: true,
              },
            ],
            color: parseInt('0x' + message.db.user.color) || 0x00
          },
        },
      });
    } else if (setter == 'plugins') {
      if (!enableGuild) {
        return message.channel.createMessage({
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
        return message.channel.createMessage({
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
        return message.channel.createMessage({
          data: {
            embed: {
              description: invalidArg,
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      if (!actionPlugins || (actionPlugins != 'enable' && actionPlugins != 'disable')) {
        return message.channel.createMessage({
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
          return message.channel.createMessage({
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
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins updated ${old.plugins} -> ${bitfield.bit}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      };
    } else if (setter == 'starboard') {
      if (!enableGuild) {
        return message.channel.createMessage({
          data: {
            embed: {
              description: 'You missing permissions: `manage_guild`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      const argChannel = message.guild.channels.find((channel) => channel.id == parseMention(args)?.channel[1]);

      if (!argChannel && args.join('').trim() != 'reset') return message.channel.createMessage({
        data: {
          embed: {
            description: 'Please mention a valide channel or enter `reset`',
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });

      if (args.join('') != 'reset') {
        // Check permissions
        const permissions = new BitField(computePermissions(message.me, message.guild, argChannel), PERMISSION);

        if (!permissions.has('SEND_MESSAGES')) return message.channel.createMessage({
          data: {
            embed: {
              description: 'I cannot send a message in this channel\nmissing permission -> `send_messages`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });

        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);

        if (!bitfield.has(PLUGINS.STARBOARD)) {
          bitfield.add(bitfield.flags.STARBOARD);
        };

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          starboard: argChannel.id,
        }).then((old) => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.STARBOARD)} updated.\n🏵️ Channels updated ${old.starboard} -> ${argChannel.id}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      } else {
        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);
        bitfield.remove(bitfield.flags.STARBOARD);

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          starboard: null,
        }).then(() => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.STARBOARD)} updated.`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      };
    } else if (setter == 'guild') {
      return message.channel.createMessage({
        data: {
          embed: {
            description: 'Guild personnal config',
            fields: [
              {
                name: '🏷️ Plugins',
                value: message.db.guild.plugins,
                inline: true,
              },
              {
                name: '⭐ Starboard',
                value: message.db.guild.starboard ?
                  `<#${message.db.guild.starboard}>` :
                  'No actif',
                inline: true,
              },
            ],
            color: parseInt('0x' + message.db.user.color) || 0x00
          },
        },
      });
    } else if (setter == 'welcome') {
      if (!enableGuild) {
        return message.channel.createMessage({
          data: {
            embed: {
              description: 'You missing permissions: `manage_guild`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      const argChannel = message.guild.channels.find((channel) => channel.id == parseMention(args)?.channel[1]);

      if (!argChannel && args.join('').trim() != 'reset') return message.channel.createMessage({
        data: {
          embed: {
            description: 'Please mention a valide channel or enter `reset`',
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });

      if (args.join('') != 'reset') {
        // Check permissions
        const permissions = new BitField(computePermissions(message.me, message.guild, argChannel), PERMISSION);

        if (!permissions.has('SEND_MESSAGES')) return message.channel.createMessage({
          data: {
            embed: {
              description: 'I cannot send a message in this channel\nmissing permission -> `send_messages`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });

        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);

        if (!bitfield.has(PLUGINS.WELCOME)) {
          bitfield.add(bitfield.flags.WELCOME);
        };

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          welcome: argChannel.id,
        }).then((old) => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.WELCOME)} updated.\n🏵️ Channels updated ${old.welcome} -> ${argChannel.id}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      } else {

        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);
        bitfield.remove(bitfield.flags.WELCOME);

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          welcome: null,
        }).then(() => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.WELCOME)} updated.`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      };
    } else if (setter == 'goodbye') {
      if (!enableGuild) {
        return message.channel.createMessage({
          data: {
            embed: {
              description: 'You missing permissions: `manage_guild`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });
      };

      const argChannel = message.guild.channels.find((channel) => channel.id == parseMention(args)?.channel[1]);

      if (!argChannel && args.join('').trim() != 'reset') return message.channel.createMessage({
        data: {
          embed: {
            description: 'Please mention a valide channel or enter `reset`',
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });

      if (args.join('') != 'reset') {
        // Check permissions
        const permissions = new BitField(computePermissions(message.me, message.guild, argChannel), PERMISSION);

        if (!permissions.has('SEND_MESSAGES')) return message.channel.createMessage({
          data: {
            embed: {
              description: 'I cannot send a message in this channel\nmissing permission -> `send_messages`',
              color: parseInt('0x' + message.db.user.color) || 0x00,
            },
          },
        });

        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);

        if (!bitfield.has(PLUGINS.GOODBYE)) {
          bitfield.add(bitfield.flags.GOODBYE);
        };

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          goodbye: argChannel.id,
        }).then((old) => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.GOODBYE)} updated.\n🏵️ Channels updated ${old.goodbye} -> ${argChannel.id}`,
                color: parseInt('0x' + message.db.user.color) || 0x00
              },
            },
          });
        });
      } else {

        const bitfield = new BitField(message.db.guild.plugins, PLUGINS);
        bitfield.remove(bitfield.flags.GOODBYE);

        return await mongoose.model('Guilds').findOneAndUpdate({
          id: message.db.guild.id,
        }, {
          plugins: bitfield.bit,
          goodbye: null,
        }).then(() => {
          return message.channel.createMessage({
            data: {
              embed: {
                description: `🎊 Plugins ${bitfield.get(PLUGINS.GOODBYE)} updated.`,
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
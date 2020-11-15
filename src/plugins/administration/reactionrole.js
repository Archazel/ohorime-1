'use strict';

const BitField = require('../../util/BitField');
const {parseMention} = require('../../util/Util');
const Commands = require('../../structures/Commands');
const emojiRegex = require('emoji-regex');
const mongoose = require('mongoose');

class ReactionRole extends Commands {
  constructor(client) {
    super(client, 'reactionrole', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES'],
    });
  };

  async handle(message, args) {
    message.channel.createMessage({
      data: {
        embed: {
          description: '📐 You want send your own reactionrole message (yes or no)',
          color: parseInt('0x' + message.db.user.color) + 0x00,
        },
      },
    });

    const collector = await message.createCollector(6e4*10, (msg) => msg.author.id == message.author.id);

    let flag = new BitField(0, {
      BOT_SEND_MESSAGE: 1 << 0,
    });

    let step = 0;

    let pos = {
      message: null,
      channel: message.channel_id,
    };
    let data = [];

    collector.on('collector', async (msg) => {
      if (msg.content == 'cancel') return collector.stop('CANCEL');
      if (step == 0) {
        if (msg.content.toLowerCase().trim() != 'yes' && msg.content.toLowerCase().trim() != 'no') return message.channel.createMessage(({
          data: {
            embed: {
              description: 'Please choose between **yes** or **no**\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        }));
        if (msg.content.toLowerCase().trim() == 'no') {
          flag.add(1 << 0);
          step = 2;
          message.channel.createMessage({
            data: {
              embed: {
                description: 'enter a emojis and a mention role\nexemple: ⚔️ @adventer\nEnter \`cancel\` for exit reactionrole',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          });
        } else {
          message.channel.createMessage(({
            data: {
              embed: {
                description: 'Enter your reactionrole message link\nEnter \`cancel\` for exit reactionrole',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          }));
          step = 1;
        };
        return;
      } else if (step == 1) {
        let ids = msg.content.match(/https:\/\/discordapp.com\/channels\/(\w{1,20})\/(\w{1,20})\/(\w{1,20})/);

        if (!ids) return message.channel.createMessage(({
          data: {
            embed: {
              description: 'Invalid discord message link\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        }));

        if (ids[1] !== message.guild_id) return message.channel.createMessage(({
          data: {
            embed: {
              description: 'The message must be in your guild\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        }));

        const _message = await message.channel.getMessage(ids[3], ids[2])
          .catch((err) => err.response.data)
          .then((res) => res.data);
        
        if (_message.code == '10008') return message.channel.createMessage({
          data: {
            embed: {
              description: 'Unknow message, please enter a valide discord message link\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });

        pos.message = ids[3];
        pos.channel = ids[2];

        message.channel.createMessage({
          data: {
            embed: {
              description: 'enter a emojis and a mention role\nexemple: ⚔️ @adventer\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });

        step = 2;
        return;
      } else if (step == 2) {
        if (msg.content == 'stop') {
          return collector.stop('STOP');
        };

        const _args = msg.content.split(/ +/g);
        let emoji = {
          name: emojiRegex().test(_args[0]) ? _args[0] : null,
          id: null,
        };

        /**
         * @todo use custom emoji
         */
        if (!emoji.name) {
          return message.channel.createMessage({
            data: {
              embed: {
                description: 'Unknow emoji\nEnter \`cancel\` for exit reactionrole',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          });
        };

        if (emoji == '⭐') return message.channel.createMessage({
          data: {
            embed: {
              description: 'Can\'t add this emoji. reason: starboard conflit\nEnter \`cancel\` for exit reactionrole',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });

        if (!emoji.name) emoji = message.guild.emojis.find((_emoji) => _emoji.id == parseMention(_args)?.emoji[3]) ||
          message.guild.emojis.find((_emoji) => _emoji.id == _args[0]);
          
        let role = message.guild.roles.find((_role) => _role.id == parseMention(_args)?.role[1]) ||
          message.guild.roles.find((_role) => _role.id == _args[1]);
          ;
        
        if (!emoji?.name) {
          return message.channel.createMessage({
            data: {
              embed: {
                description: 'Unknow emoji\nEnter \`cancel\` for exit reactionrole',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          });
        };

        if (!role) {
          return message.channel.createMessage({
            data: {
              embed: {
                description: 'Unknow role\nEnter \`cancel\` for exit reactionrole',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          });
        };
        data.push([emoji, role]);
        return message.channel.createMessage({
          data: {
            embed: {
              description: `🛍️ Peer saved ${emoji.name} <-> ${role.name}\nIf you have finished enter \`stop\`\nEnter \`cancel\` for exit reactionrole`,
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });
      };
      return;
    });

    collector.on('end', async (code) => {
      if (code == 'CANCEL') {
        return message.channel.createMessage({
          data: {
            embed: {
              description: 'reactionrole cancelled',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });
      };

      message.channel.createMessage({
        data: {
          embed: {
            description: '🎀 reactionrole created !',
            color: parseInt('0x' + message.db.user.color) + 0x00,
          },
        },
      });
      if (flag.has(1 << 0)) {
        pos.message = await message.channel.createMessage({
          data: {
            embed: {
              description: `React to obtain an associated role\n\n${data.map(([e, r]) => `${e.name} ● <@&${r.id}>`).join('\n')}`,
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        }).then((res) => res.data.id);      
      };

      for await (const [emoji] of data) {
        console.log(emoji);
        await message.channel.createReaction(pos.message, encodeURI(emoji.name), pos.channel).catch((e) => console.log(e.response.data));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      };

      await mongoose.model('Reactionrole').create({
        messageID: pos.message,
        channelID: pos.channel,
        link: [
          ...data.map((d) => ([{
            name: d[0].name,
            id: d[0].id,
          }, {
            name: d[1].name,
            id: d[1].id,
          }])),
        ],
      });
    });
  };
};

module.exports = exports = ReactionRole;
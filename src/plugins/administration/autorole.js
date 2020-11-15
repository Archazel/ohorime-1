'use strict';

const BitField = require('../../util/BitField');
const {parseMention} = require('../../util/Util');
const Commands = require('./../../structures/Commands');

class Autorole extends Commands {
  constructor(client) {
    super(client, 'autorole', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES'],
    });
  };

  async handle(message, args) {
    message.channel.createMessage({
      data: {
        embed: {
          description: '📐 You want send your own autorole message (yes or no)',
          color: parseInt('0x' + message.db.user.color) + 0x00,
        },
      },
    });

    const collector = await message.createCollector(6e4, (msg) => msg.author.id == message.author.id);

    let flag = new BitField(0, {
      BOT_SEND_MESSAGE: 1 << 0,
    });

    let step = 0;

    let msgID;

    collector.on('collector', async (msg) => {
      if (step == 0) {
        if (msg.content.toLowerCase().trim() != 'yes' && msg.content.toLowerCase().trim() != 'no') return message.channel.createMessage(({
          data: {
            embed: {
              description: 'Please choose between **yes** or **no**',
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
                description: 'enter a emojis and a mention role\nexemple: ⚔️ @adventer',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          });
        } else {
          message.channel.createMessage(({
            data: {
              embed: {
                description: 'Enter your autorole message link',
                color: parseInt('0x' + message.db.user.color) + 0x00,
              },
            },
          }));
          step = 1;
        };
        return;
      } else if (step == 1) {
        let ids = /https:\/\/discordapp.com\/channels\/(\w{1,20})\/(\w{1,20})\/(\w{1,20})/.match(msg.content);

        if (!ids) return message.channel.createMessage(({
          data: {
            embed: {
              description: 'Invalid discord message link',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        }));

        if (ids[1] !== message.guild_id) return message.channel.createMessage(({
          data: {
            embed: {
              description: 'The message must be in your guild',
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
              description: 'Unknow message, please enter a valide discord message link',
              color: parseInt('0x' + message.db.user.color) + 0x00,
            },
          },
        });

        msgID = ids[3];

        step = 2;
      } else if (step == 2) {
        /**
         * @todo Add emoji
         */
      };
    });
    collector.on('end', (...args) => console.log('end', ...args));
  };
};

module.exports = exports = Autorole;
'use strict';

const mongoose = require('mongoose');
const {calculator, parseNum} = require('../../util/Util');
const Commands = require('./../../structures/Commands');

class Leaderboard extends Commands {
  constructor(client) {
    super(client, 'leaderboard', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  async handle(message, args) {
    const users = await mongoose.model('Leveling').find({
      guildID: message.guild_id,
      actif: true,
    }, ['messages', 'userID'], {
      limit: 10,
      sort: {
        messages: -1
      },
    });

    const embed = {
      description: `${message.guild.name} leaderboard`,
      fields: users
        .filter((user) => Boolean(message.guild.members.find((member) => member.user.id == user.userID)))
        .map((user) => ({
          name: message.guild.members.find((member) => member.user.id == user.userID).user.username,
          value: `${parseNum(calculator(user.messages).lvl)} lvl - ${parseNum(calculator(user.messages).xp)} xp`,
          inline: false,
        })),
      color: parseInt('0x' + message.db.user.color) || 0x00,
    };

    message.channel.createMessage({
      data: {
        embed: embed,
      },
    });
  };
};

module.exports = exports = Leaderboard;
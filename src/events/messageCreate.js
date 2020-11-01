'use strict';

const Events = require('../structures/Events');
const mongoose = require('mongoose');
const BitField = require('../util/BitField');
const {ChannelNode} = require('kobu-lib');
const {flags: {PERMISSION, MESSAGE, PLUGINS}} = require('./../util/Constant');

class Message extends Events {
  constructor(client) {
    super(client, 'MESSAGE_CREATE', {});
  };

  async handle(message) {
    console.log(message);

    message.guild = await this.client.redis.socket.get(`guild_${message.guild_id}`).then(JSON.parse);

    console.log(message.guild);

    message.bitfield = new BitField(message.flags, MESSAGE);

    if (message.author.bot || message.bitfield.has('URGENT')) return;

    message.db = {};

    await mongoose.model('Users').findOne({id: message.author.id}, async (err, user) => {
      if (user) return message.db.user = user;
      return await mongoose.model('Users').create({
        id: message.author.id,
      }).then((_user) => {
        message.db.user = _user;
      });
    });

    message.db.guild = await mongoose.model('Guilds').findOne({id: message.guild_id});

    message.db.guild.bitfield = new BitField(message.db.guild.plugins, PLUGINS);

    if (!message.content.startsWith('o!')) return;

    const args = message.content.slice(2).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const plugin = this.client.plugins.find((plugin) => plugin.commands.has(command));
    
    if (!plugin) return console.log('Plugins not found');

    if (plugin.name != 'default' && !message.db.guild.bitfield.has(plugin.name.toUpperCase())){
      return new ChannelNode(this.client)
      .createMessage(message.channel_id, {
        data: {
          embed: {
            description:
              `[${
                plugin.name}] plugins disable, please try \`o!config plugins enable ${plugin.name}\``,
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        },
      });
    };
    const cmd = plugin.commands.get(command);
    if (!cmd) return console.log('Command not found');
    
    cmd.handle(message, args);
  };
};

module.exports = exports = Message;
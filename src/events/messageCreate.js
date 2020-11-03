'use strict';

const Events = require('../structures/Events');
const mongoose = require('mongoose');
const BitField = require('../util/BitField');
const {ChannelNode} = require('kobu-lib');
const {flags: {PERMISSION, MESSAGE, PLUGINS}} = require('./../util/Constant');
const {computePermissions} = require('./../util/Util');

class Message extends Events {
  constructor(client) {
    super(client, 'MESSAGE_CREATE', {});
  };

  async handle(message) {
    message.bitfield = new BitField(message.flags, MESSAGE);

    if (message.author.bot || message.bitfield.has('URGENT')) return;

    message.member.id = message.author.id;

    message.guild = await this.client.redis.socket.get(`guild_${message.guild_id}`).then(JSON.parse);

    message.channel = message.guild.channels.find((channel) => channel.id === message.channel_id);
    
    message.bot = await this.client.redis.socket.get('user').then(JSON.parse);

    message.me = message.guild.members.find((member) => member.user.id == message.bot.id);
    message.me.id = message.me.user.id;

    message.me.bitfield = new BitField(computePermissions(message.me, message.guild, message.channel), PERMISSION);
    
    if (!message.me.bitfield.has('SEND_MESSAGES')) return;
    
    message.member.bitfield = new BitField(computePermissions(message.member, message.guild, message.channel), PERMISSION);
    
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

    const channelNode = new ChannelNode(this.client);

    if (plugin.name != 'default' && !message.db.guild.bitfield.has(plugin.name.toUpperCase())) {
      const msg = `[${
        plugin.name}] plugins disable, please try \`o!config plugins enable ${plugin.name}\``;
      return channelNode.createMessage(message.channel_id, {
        data: message.me.bitfield.has('EMBED_LINKS') ? 
        {
          embed: {
            description: msg,
            color: parseInt('0x' + message.db.user.color) || 0x00,
          },
        } : 
        {
          content: msg,
        },
      });
    };

    const cmd = plugin.commands.get(command);
    if (!cmd) return console.log('Command not found');

    if (!message.me.bitfield.has('ADMINISTRATOR')) {
      let missing = [];
      for (const perm of cmd.data.mePermissions) {
        if (!message.me.bitfield.has(perm)) missing.push(perm.toLowerCase());
      };

      if (missing.length > 0) {
        const msg = `Bot missing permissions: \`${missing.join('`, `')}\``;
        return channelNode.createMessage(message.channel_id, {
          data: !message.me.bitfield.has('EMBED_LINKS') ? 
          {
            content: msg,
          } : {
            embed: {
              description: msg,
              color: parseInt('0x' + message.db.user.color) || 0x00,
            }
          },
        });
      };
    };

    if (!message.member.bitfield.has('ADMINISTRATOR')) {
      let missing = [];
      for (const perm of cmd.data.memberPermissions) {
        console.log(perm, message.member.bitfield.has(perm));
        if (!message.member.bitfield.has(perm)) missing.push(perm.toLowerCase());
      };

      console.log(missing);

      if (missing.length > 0) {
        const msg = `You missing permissions: \`${missing.join('`, `')}\``;
        return channelNode.createMessage(message.channel_id, {
          data: !message.me.bitfield.has('EMBED_LINKS') ?
          {
            content: msg,
          } : {
            embed: {
              description: msg,
              color: parseInt('0x', message.db.color) || 0x00,
            },
          },
        });
      };
    };
    
    cmd.handle(message, args);
  };
};

module.exports = exports = Message;
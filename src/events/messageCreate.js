'use strict';

const Events = require('../structures/Events');
const mongoose = require('mongoose');
const BitField = require('../util/BitField');
const {ChannelNode} = require('kobu-lib');
const {flags: {PERMISSION, MESSAGE, PLUGINS}} = require('./../util/Constant');
const {computePermissions} = require('./../util/Util');
const Collector = require('../util/Collector');

class Message extends Events {
  constructor(client) {
    super(client, 'MESSAGE_CREATE', {});
  };

  async handle(message) {
    // Collector broadcast
    for (const collector of this.client.collectors
      .array().filter((br) => br.channel == message.channel_id)) {
        if (collector.filter(message)) return collector.exec(message);
    };

    message.bitfield = new BitField(message.flags, MESSAGE);

    message.createCollector = (timeout, filter) => {
      const collector = new Collector(this.client, {message: message.id, channel: message.channel_id}, {timeout, filter});
      this.client.collectors.set(collector.uuid, collector);
      return collector;
    };

    if (message.author.bot || message.bitfield.has('URGENT')) return;

    message.channel = new ChannelNode(this.client, message.channel_id);

    message.member.id = message.author.id;

    message.guild = await this.client.redis.socket.get(`guild_${message.guild_id}`).then(JSON.parse);
    
    for (const [key, value] of Object.entries(message.guild.channels.find((channel) => channel.id === message.channel_id))) {
      message.channel[key] = value;
    };
    
    message.bot = await this.client.redis.socket.get('user').then(JSON.parse);

    message.me = message.guild.members.find((member) => member.user.id == message.bot.id);
    message.me.id = message.me.user.id;

    message.me.bitfield = new BitField(computePermissions(message.me, message.guild, message.channel), PERMISSION);

    message.db = {};

    const _user = await mongoose.model('Users').exists({id: message.author.id});
    
    if (_user) {
      message.db.user = await mongoose.model('Users').findOne({id: message.author.id});
    } else {
      message.db.user = await mongoose.model('Users').create({
        id: message.author.id,
      });
    };
    
    message.db.guild = await mongoose.model('Guilds').findOne({id: message.guild_id});
    
    message.member.bitfield = new BitField(computePermissions(message.member, message.guild, message.channel), PERMISSION);
    
    message.db.guild.bitfield = new BitField(message.db.guild.plugins, PLUGINS);

    if (message.db.guild.bitfield.has('LEVELING')) {
      await new Promise((resolve) => {
        mongoose.model('Leveling').exists({guildID: message.guild_id, userID: message.author.id}, async (err, exist) => {
          if (exist) {
            await mongoose.model('Leveling').findOneAndUpdate({guildID: message.guild_id, userID: message.author.id}, {
              $inc: {
                messages: 1,
                [`channels.${message.channel_id}`]: 1,
              },        
            });
            resolve();
          } else {
            await mongoose.model('Leveling').create({
              guildID: message.guild_id,
              userID: message.author.id,
              messages: 1,
              channels: {
                [message.channel_id]: 1,
              },
            });
            resolve();
          };
        });
      });
    };

    if (!message.me.bitfield.has('SEND_MESSAGES')) return;

    if (!message.content.startsWith(message.db.user.prefix)) return;

    const args = message.content.slice(message.db.user.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const plugin = this.client.plugins.find((plugin) => plugin.commands.has(command));
    
    if (!plugin) return console.log('Plugins not found');

    if (plugin.name != 'default' && !message.db.guild.bitfield.has(plugin.name.toUpperCase())) {
      const msg = `[${
        plugin.name}] plugins disable, please try \`o!config plugins ${plugin.name} enable\``;
      return message.channel.createMessage({
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
        return message.channel.createMessage({
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
        if (!message.member.bitfield.has(perm)) missing.push(perm.toLowerCase());
      };

      if (missing.length > 0) {
        const msg = `You missing permissions: \`${missing.join('`, `')}\``;
        return message.channel.createMessage({
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
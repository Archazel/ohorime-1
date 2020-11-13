'use strict';

const Events = require('./../structures/Events');
const mongoose = require('mongoose');
const BitField = require('../util/BitField');
const {flags: {PLUGINS, PERMISSION}} = require('./../util/Constant');
const {ChannelNode} = require('kobu-lib');
const {computeBasePermissions} = require('../util/Util');

class MessageReactionAdd extends Events{
  constructor(client) {
    super(client, 'MESSAGE_REACTION_ADD', {});

    this.stars = ['⭐', '🌟', '🌠', '💫'];
  };

  async handle(reaction) {    
    if (reaction.emoji.name != this.stars[0]) return;

    const dbGuild = await mongoose.model('Guilds').findOne({id: reaction.guild_id}, ['plugins', 'starboard']);
    const bitfield = new BitField(dbGuild.plugins, PLUGINS);

    if (!bitfield.has(PLUGINS.STARBOARD)) return;

    const starboard = await new Promise(async (resolve) => {
      await mongoose.model('Starboard').exists({id: reaction.message_id, guild: reaction.guild_id}, async (err, exist) => {
        if (err) throw Error(err);
        if (exist) {
          await mongoose.model('Starboard').findOne({id: reaction.message_id, guild: reaction.guild_id}).then(resolve);
        } else {
          await mongoose.model('Starboard').create({
            id: reaction.message_id,
            guild: reaction.guild_id
          }).then(resolve);
        };
      });
    });

    const channelNode = new ChannelNode(this.client, reaction.channel_id)
    const reactions = await channelNode.getReactions(reaction.message_id, encodeURI(this.stars[0])).then((res) => res.data);
    const guild = await this.client.redis.socket.get(`guild_${reaction.guild_id}`).then(JSON.parse);
    const channel = guild.channels.find((channel) => channel.id == reaction.channel_id);
    const starboardChannel = guild.channels.find((_channel) => _channel.id == dbGuild.starboard);
    if (!starboardChannel) return;
    const bot = await this.client.redis.socket.get('user').then(JSON.parse);
    const me = guild.members.find((member) => member.user.id == bot.id);
    const permissions = new BitField(computeBasePermissions(me, guild, starboardChannel), PERMISSION);
    if (!permissions.has('SEND_MESSAGES')) return;
    const originMessage = await channelNode.getMessage(reaction.message_id).then((res) => res.data);
    const dbUser = await mongoose.model('Users').findOne({id: originMessage.author.id}, ['color']);

    let star;

    if (reactions.length < 5) {
      star = this.stars[0];
    } else if (reactions.length < 10) {
      star = this.stars[1];
    } else if (reactions.length < 20) {
      star = this.stars[2];
    } else star = this.stars[3];

    if (!starboard.referred) {      
      return this.createReferrer(permissions, star, reactions, channel, originMessage, reaction, channelNode, dbGuild, dbUser);
    } else {
      if (!permissions.has('EMBED_LINKS')) {
        const callback = await channelNode.editMessage(starboard.referred, {
          data: {
            content: `Please add me embed links permissions`,
          },
        }, dbGuild.starboard).then((res) => res.data).catch((err) => err.response.data);

        // If message referrer is delete
        if (callback.code == '10008') {
          return this.createReferrer(permissions, star, reactions, channel, originMessage, reaction, channelNode, dbGuild, dbUser);
        };
      } else {
        const callback = await channelNode.editMessage(starboard.referred, {
          data: {
            content: `${star} ${reactions.length} ● <#${channel.id}>`,
            embed: {
              author: {
                name: originMessage.author.username,
                icon_url: `https://cdn.discordapp.com/avatars/${originMessage.author.id}/${originMessage.author.avatar}.${originMessage.author.avatar.startsWith('a_') ? 'gif' : 'png'}`,
              },
              description: originMessage.content,
              image: {
                url: originMessage.attachments[0]?.url
              },
              color: dbUser?.color ? parseInt('0x' + dbUser.color) || 0x00 : 0x00,
            },
          },
        }, dbGuild.starboard).catch((err) => err.response.data);

        // If message referrer is delete
        if (callback.code == '10008') {
          return this.createReferrer(permissions, star, reactions, channel, originMessage, reaction, channelNode, dbGuild, dbUser);
          };
      };
    };
  };

  async createReferrer(permissions, star, reactions, channel, originMessage, reaction, channelNode, dbGuild, dbUser) {
    const msg = permissions.has('EMBED_LINKS') ? {
      content: `${star} ${reactions.length} ● <#${channel.id}>`,
      embed: {
        author: {
          name: originMessage.author.username,
          icon_url: `https://cdn.discordapp.com/avatars/${originMessage.author.id}/${originMessage.author.avatar}.${originMessage.author.avatar.startsWith('a_') ? 'gif' : 'png'}`,
        },
        description: originMessage.content,
        image: {
          url: originMessage.attachments[0]?.url
        },
        color: dbUser?.color ? parseInt('0x' + dbUser.color) || 0x00 : 0x00,
      },
    } : {
      content: `Please add me embed links permissions`,
    };

    const referredMessage = await channelNode.createMessage({
      data: msg,
    }, dbGuild.starboard).then((res) => res.data).catch((e) => {});

    if (!referredMessage) return;

    await mongoose.model('Starboard').findOneAndUpdate({
      id: reaction.message_id,
      guild: reaction.guild_id,
    }, {
      referred: referredMessage.id,
    });
  };
};

module.exports = exports = MessageReactionAdd;
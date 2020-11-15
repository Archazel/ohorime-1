'use strict';

const BitField = require('../util/BitField');
const Events = require('./../structures/Events');
const mongoose = require('mongoose');
const {flags: {PLUGINS}} = require('./../util/Constant');
const {Canvas, resolveImage} = require('canvas-constructor');
const {registerFont, loadImage} = require('canvas');
const {ChannelNode} = require('kobu-lib');
const path = require('path');
const FormData = require('form-data');

registerFont('./assets/fonts/Comfortaa/static/Comfortaa-Regular.ttf', { family: 'Comfortaa' });

class GuildMemberAdd extends Events{
  constructor(client) {
    super(client, 'GUILD_MEMBER_ADD', {});
  };

  async handle(member) {
    const guild = await this.client.redis.socket.get(`guild_${member.guild_id}`).then(JSON.parse);

    guild.members.push(member);

    await this.client.redis.socket.set(`guild_${member.guild_id}`, JSON.stringify(guild));

    const guildDB = await mongoose.model('Guilds').findOne({
      id: member.guild_id,
    }, ['welcome', 'plugins']);
    
    const bitfield = new BitField(guildDB.plugins, PLUGINS);

    if (!bitfield.has(PLUGINS.WELCOME)) return;

    const background = await resolveImage(path.resolve(path.join(__dirname, '/welcome.jpg')));
    const pp = await loadImage(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`);

    const userDB = await mongoose.model('Users').findOne({
      id: member.user.id,
    }, ['color']);

    const resolution = [16, 6];
    const base = 40;
    const width = base*resolution[0];
    const height = base*resolution[1];

    const canvas = new Canvas(width, height)
      .printImage(background, 0, 0, width, height)
      .setGlobalAlpha(0.5)
      .setColor('#000000')
      .printRectangle(10 ,10, width-20, height-20)
      .save()

      .setGlobalAlpha(0.5)
      .setColor(`#${userDB.color}`)

      .beginPath()
      .moveTo((width*75)/100, height+5)
      .lineTo(width+5, (height*20)/100)
      .setLineWidth(8)
      .stroke()
      .save()

      .beginPath()
      .moveTo((width*80)/100 , height+5)
      .lineTo(width+5, (height*35)/100)
      .setLineWidth(8)
      .stroke()
      .save()

      .setGlobalAlpha(1)
      .printCircularImage(pp, 101, height/2, 60)
      .save()

      .setColor('#E5E5E5')

      .setTextFont('80px "Comfortaa"')
      .printText('Welcome', width/3, height/2.2)
      .save()

      .setColor(`#${userDB.color}`)
      .setTextFont(`${100-4*member.user.username.length}px "Comfortaa"`)
      .printText(member.user.username, width/2.8, height/1.2)
      .save()

      .toBuffer();

      const form = new FormData();

      form.append(`welcome-${member.user.id}.png`, canvas, `welcome-${member.user.id}.png`);
  
      new ChannelNode(this.client, guildDB.welcome).createMessage({
        data: form,
        headers: {
          ...form.getHeaders(),
        },
      });
  };
};

module.exports = exports = GuildMemberAdd;